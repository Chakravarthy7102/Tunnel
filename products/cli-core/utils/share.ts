import { openTunnelInBrowser } from '#utils/browser.ts';
import { getOrCreateLocalWorkspace } from '#utils/local-project/initialize.ts';
import { supportMessage } from '#utils/message.ts';
import { promptLocalServicePort } from '#utils/port.ts';
import { promptForUniqueTunnelappProjectLivePreviewUrl } from '#utils/project-live-preview-slug.ts';
import type { Actor } from '@-/actor';
import { getTunnelCliSourceDirpath } from '@-/cli-source/dirpath';
import { getCliStorage } from '@-/cli-storage';
import type {
	DocBase,
	Id,
	ServerDoc,
} from '@-/database';
import type { User_$profileData } from '@-/database/selections';
import { RELEASE } from '@-/env/app';
import { HostEnvironmentType } from '@-/host-environment';
import {
	getLocalProjectEnvironment,
	getLocalProjectGitMetadata,
	getLocalProjectRootDirpath,
} from '@-/local-project';
import { logger } from '@-/logger';
import {
	createLocalProxyContext,
	getHostOfLocalPort,
	getLocalProxy,
	startLocalProxyServer,
} from '@-/tunnel-instance-local-proxy-server';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { getReleaseProjectLivePreviewUrl } from '@-/url';
import { isCancel, SelectPrompt } from '@clack/core';
import ansiEscapes from 'ansi-escapes';
import chalk from 'chalk';
import { $try, ok } from 'errok';
import getPort from 'get-port';
import { humanId } from 'human-id';
import logSymbols from 'log-symbols';
import fs from 'node:fs';
import ora from 'ora';
import { outdent } from 'outdent';
import pMinDelay from 'p-min-delay';
import path from 'pathe';
import invariant from 'tiny-invariant';
import { getWebappTrpc } from './trpc.ts';

export const tunnelShare = ({
	actorData,
	options,
}: {
	actorData: {
		userActor: Actor<'User'>;
		actorUser: ServerDoc<typeof User_$profileData>;
		accessToken: string;
	};
	options: {
		projectPathInput: string;
		port?: number;
		organizationSlug?: string;
		subdomain?: string;
		project?: string;
		open?: boolean;
		logLevel?: string;
	};
	// eslint-disable-next-line complexity -- TODO
}) => ($try(async function*() {
	const cliStorage = getCliStorage();
	const { webappTrpc } = await getWebappTrpc();

	const localProjectWorkingDirpath = path.resolve(
		process.cwd(),
		options.projectPathInput,
	);

	// Make sure that the path input exists
	if (!fs.existsSync(localProjectWorkingDirpath)) {
		const noProjectFoundAtPathErrorMessage =
			options.projectPathInput.startsWith('/') ?
				`${logSymbols.error} ${
					chalk('No project found at path')
				} ${options.projectPathInput}` :
				`${logSymbols.error} ${
					chalk(
						'No project found at path',
					)
				} ${
					chalk.green(
						options.projectPathInput.startsWith('.') ?
							options.projectPathInput :
							'./' + options.projectPathInput,
					)
				} ${
					chalk.dim(
						`(resolved to ${
							chalk.green(
								path.resolve(process.cwd(), options.projectPathInput),
							)
						})`,
					)
				}\n`;

		process.stderr.write(noProjectFoundAtPathErrorMessage);

		if (/^\d+$/.test(options.projectPathInput)) {
			const portNumber = options.projectPathInput;
			process.stderr.write(
				'\n' +
					chalk.italic(
						`${logSymbols.info} To share your project that's listening on port ${
							chalk.green(
								portNumber,
							)
						}, run ${
							chalk.yellow(
								`tunnel share -p ${chalk.green(portNumber)}`,
							)
						}`,
					) +
					'\n',
			);
		} else {
			process.stderr.write(
				`\n  ${chalk.dim('`')}${
					chalk.bold(
						`tunnel share ${chalk.reset.underline.green('<path>')}`,
					)
				}${
					chalk.dim(
						'`',
					)
				} needs the path to an existing project on your computer ${
					chalk.dim(
						'(defaults to the current working directory)',
					)
				}\n`,
			);
		}

		process.stderr.write('\n' + supportMessage + '\n');

		process.exit(1);
	}

	const { localProjectRootDirpath, reasonMessage } =
		await getLocalProjectRootDirpath({
			workingDirpath: localProjectWorkingDirpath,
		});
	process.stdout.write(reasonMessage);

	const localProjectGitMetadata = await getLocalProjectGitMetadata({
		localProjectRootDirpath,
	});

	const localTunnelProxyServerPortNumber = await getPort();

	const { linkedTunnelInstanceProxyPreview } = yield* getOrCreateLocalWorkspace(
		{
			localProjectWorkingDirpath,
			localProjectRootDirpath,
			actor: actorData.userActor,
			localTunnelProxyServerPortNumber,
			providedLocalServicePortNumber: options.port ?? null,
			providedOrganizationSlug: options.organizationSlug ?? null,
			actorUserId: actorData.actorUser._id,
			localProjectGitMetadata,
		},
	).safeUnwrap();

	const tunnelInstanceProxyPreview =
		yield* (await webappTrpc.tunnelInstanceProxyPreview.get$dashboardPageData
			.query({
				actor: actorData.userActor,
				tunnelInstanceProxyPreview: {
					id: linkedTunnelInstanceProxyPreview._id,
				},
			})).safeUnwrap();

	if (tunnelInstanceProxyPreview === null) {
		logger.error(
			`Could not find tunnel instance proxy preview with ID ${linkedTunnelInstanceProxyPreview._id}\n`,
		);
		process.exit(1);
	}

	if (options.port !== undefined) {
		tunnelInstanceProxyPreview.localServicePortNumber = options.port;
	}

	const { finalLocalServicePortNumber, localApplicationLocalAddress } =
		await connectToLocalPort({
			initialLocalServicePortNumber:
				tunnelInstanceProxyPreview.localServicePortNumber,
			tunnelInstanceProxyPreviewId: tunnelInstanceProxyPreview._id,
			userActor: actorData.userActor,
		});

	tunnelInstanceProxyPreview.localServicePortNumber =
		finalLocalServicePortNumber;
	// We update the tunnel instance proxy preview with the new local proxy port number
	const updateResult = await webappTrpc.tunnelInstanceProxyPreview.update
		.mutate({
			actor: actorData.userActor,
			tunnelInstanceProxyPreview: {
				id: tunnelInstanceProxyPreview._id,
			},
			updates: {
				localTunnelProxyServerPortNumber,
				...(options.port !== undefined &&
						tunnelInstanceProxyPreview.localServicePortNumber !==
							options.port ?
					{
						localServicePortNumber: options.port,
					} :
					{}),
			},
		});

	if (updateResult.isErr()) {
		process.stderr.write('Failed to update tunnel instance proxy preview\n');
	}

	let projectLivePreview: DocBase<'ProjectLivePreview'>;

	// If the tunnel instance doesn't have any live previews associated with it, we create one
	if (tunnelInstanceProxyPreview.projectLivePreviews.length === 0) {
		const generatedSlug = humanId({ separator: '-', capitalize: false });
		let url = (options.subdomain ?? generatedSlug) + '.tunnelapp.dev';

		const existingProjectLivePreview =
			yield* (await webappTrpc.projectLivePreview
				.getPublicData.query({
					projectLivePreview: {
						url,
					},
				})).safeUnwrap();

		if (existingProjectLivePreview !== null) {
			// eslint-disable-next-line no-await-in-loop -- Need to block until user chooses a new subdomain
			url = yield* promptForUniqueTunnelappProjectLivePreviewUrl({
				initialUrl: url,
			}).safeUnwrap();
		}

		projectLivePreview =
			yield* (await webappTrpc.projectLivePreview.create.mutate({
				actor: actorData.userActor,
				project: {
					id: tunnelInstanceProxyPreview.project._id,
				},
				slug: url.replace('.tunnelapp.dev', ''),
				linkedTunnelInstanceProxyPreview: {
					id: tunnelInstanceProxyPreview._id,
				},
				createdByUser: {
					id: actorData.userActor.data.id,
				},
			})).safeUnwrap();
	} else {
		projectLivePreview =
			tunnelInstanceProxyPreview.projectLivePreviews.length === 1 &&
				tunnelInstanceProxyPreview.projectLivePreviews[0] !== undefined ?
				tunnelInstanceProxyPreview.projectLivePreviews[0] :
				await (async () => {
					process.stdout.write(
						chalk.magentaBright.bold(
							'📡 Which project live preview do you want to share?\n',
						),
					);

					// We need to prompt the user to choose a live preview to link the tunnel to
					const projectLivePreviewSelectPrompt = new SelectPrompt({
						options: tunnelInstanceProxyPreview.projectLivePreviews.map(
							(projectLivePreview) => ({
								url: projectLivePreview.url,
								value: projectLivePreview._id,
							}),
						),
						render() {
							return this.options
								.map((option) => {
									if (option.value === this.value) {
										return chalk.cyan(`❯ ${chalk.bold(option.url)}`);
									} else {
										return `${chalk.hidden('❯')} ${option.url}`;
									}
								})
								.join('\n');
						},
					});

					const projectLivePreviewId = await projectLivePreviewSelectPrompt
						.prompt();
					if (isCancel(projectLivePreviewId)) {
						process.exit(1);
					}

					const selectedProjectLivePreview = tunnelInstanceProxyPreview
						.projectLivePreviews.find(
							(projectLivePreview) =>
								projectLivePreview._id === projectLivePreviewId,
						);
					invariant(
						selectedProjectLivePreview !== undefined,
						'The user can only choose from one of the values of `tunnelInstance.livePreviews`',
					);
					return selectedProjectLivePreview;
				})();

		// If a custom subdomain was specified, we should update it
		if (options.subdomain !== undefined) {
			let newUrl = options.subdomain + '.tunnelapp.dev';
			projectLivePreview.url = newUrl;
			const existingProjectLivePreview =
				yield* (await webappTrpc.projectLivePreview
					.getPublicData.query({
						projectLivePreview: {
							url: newUrl,
						},
					})).safeUnwrap();

			if (existingProjectLivePreview !== null) {
				newUrl = yield* promptForUniqueTunnelappProjectLivePreviewUrl({
					initialUrl: newUrl,
				}).safeUnwrap();
			}

			yield* (await webappTrpc.projectLivePreview.update.mutate({
				actor: actorData.userActor,
				projectLivePreview: {
					id: projectLivePreview._id,
				},
				updates: {
					url: newUrl,
				},
			})).safeUnwrap();
		}
	}

	const LocalProxy = getLocalProxy();

	const tunnelCliSourceDirpath = getTunnelCliSourceDirpath({
		version: tunnelPublicPackagesMetadata['@tunnel/cli'].version,
		release: RELEASE,
	});
	const localProjectEnvironment = await getLocalProjectEnvironment({
		localServicePortNumber: finalLocalServicePortNumber,
		localTunnelProxyServerPortNumber,
		localProjectRootDirpath,
		localProjectWorkingDirpath,
		tunnelCliSourceDirpath,
		localProjectGitMetadata,
		providedProjectId: options.project ?? null,
	});

	const context = createLocalProxyContext({
		hostEnvironment: {
			type: HostEnvironmentType.tunnelShare,
			localProjectEnvironment,
		},
		actor: actorData.userActor,
		localProjectEnvironment,
		localProjectRuntime: {
			localApplicationLocalAddress,
		},
	});

	context.state.projectLivePreviewId = projectLivePreview._id;

	await startLocalProxyServer({ context });

	await LocalProxy.TunnelInstanceProxyPreview.connect({
		context,
		actor: actorData.userActor,
		tunnelInstanceProxyPreviewId: tunnelInstanceProxyPreview._id,
	});

	if (options.open) {
		await openTunnelInBrowser({
			projectLivePreviewUrl: projectLivePreview.url,
		});
	}

	if (options.logLevel) {
		const logLevels = options.logLevel.split(',');
		const logLevelSettings: { [key: string]: string } = {};

		for (const level of logLevels) {
			const [context, value] = level.split(':');

			if (context === undefined || value === undefined) {
				return ok();
			}

			logLevelSettings[context] = value;
		}

		await cliStorage.set((oldData) => ({
			...oldData,
			logLevel: {
				...oldData.logLevel,
				...logLevelSettings,
			},
		}));
	} else {
		await cliStorage.set((oldData) => ({
			...oldData,
			logLevel: {},
		}));
	}

	const cliStorageData = await cliStorage.get();
	const logLevelSettings = cliStorageData.logLevel;
	const logLevelSetttingsExists = Object.entries(logLevelSettings).length > 0;

	const tunnelappUrl = getReleaseProjectLivePreviewUrl({
		hostname: projectLivePreview.url,
		withScheme: true,
	});

	process.stdout.write(outdent({
		trimTrailingNewline: false,
		trimLeadingNewline: false,
	})`
		████████╗██╗   ██╗███╗   ██╗███╗   ██╗███████╗██╗
		╚══██╔══╝██║   ██║████╗  ██║████╗  ██║██╔════╝██║
		   ██║   ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║
		   ██║   ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║
		   ██║   ╚██████╔╝██║ ╚████║██║ ╚████║███████╗███████╗
		   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚══════╝

		${
		chalk.bold('Account')
	}			${actorData.actorUser.username} / ${actorData.actorUser.email}
		${
		chalk.bold('Origin')
	}			${tunnelInstanceProxyPreview.project.organization.name} / ${tunnelInstanceProxyPreview.project.name}
		${chalk.bold('URL')}			${tunnelappUrl}
		${
		chalk.bold(
			'Forwarding',
		)
	}		${tunnelappUrl} <> http://localhost:${finalLocalServicePortNumber}

		Press CTRL+C to stop sharing${logLevelSetttingsExists ? '\n' : ''}
	`);
	return ok();
}));

async function connectToLocalPort(
	{ initialLocalServicePortNumber, tunnelInstanceProxyPreviewId, userActor }: {
		initialLocalServicePortNumber: number;
		tunnelInstanceProxyPreviewId: Id<'TunnelInstanceProxyPreview'>;
		userActor: Actor<'User'>;
	},
): Promise<
	{ finalLocalServicePortNumber: number; localApplicationLocalAddress: string }
> {
	const { webappTrpc } = await getWebappTrpc();
	const getConnectingToPortMessage = (portNumber: number) =>
		`Attempting to connect to local port ${
			chalk.green(
				portNumber,
			)
		} (make sure your app is running on this port...)\n  ${
			// dprint-ignore
			chalk.italic(
			chalk.dim('Wrong port? Press "') +
			chalk.green('p') +
			chalk.dim('" to switch ports or run ') +
			chalk.yellow('tunnel share -p <port>')
		)}`;

	const spinner = ora();
	spinner.start(
		getConnectingToPortMessage(initialLocalServicePortNumber),
	);

	const {
		portNumber: localServicePortNumber,
		host: localApplicationLocalAddress,
	} = await new Promise<{
		portNumber: number;
		host: string;
	}>((resolve) => {
		let abortController: AbortController;
		let hasSwitchedPorts = false;

		const onData = async (data: Buffer) => {
			if (data[0] === 0x03) {
				process.stdout.write('\n');
				process.exit(0);
			}

			if (data[0] === 112) {
				spinner.stop();
				process.stdin.setRawMode(false);

				// Stop waiting for the original host
				abortController.abort();

				// Clear the previous port prompt
				if (hasSwitchedPorts) {
					process.stdout.write(
						ansiEscapes.cursorUp(1) + ansiEscapes.eraseLine,
					);
				}

				// Get the new port number
				const newPortNumber = await promptLocalServicePort();
				hasSwitchedPorts = true;
				process.stdin.setRawMode(true);

				spinner.text = 'Updating port...';
				spinner.start();

				// Update the port number on the server
				const result = await pMinDelay(
					webappTrpc.tunnelInstanceProxyPreview.update.mutate({
						actor: userActor,
						tunnelInstanceProxyPreview: {
							id: tunnelInstanceProxyPreviewId,
						},
						updates: {
							localServicePortNumber: newPortNumber,
						},
					}),
					500,
				);

				if (result.isErr()) {
					logger.error('Failed to update port number on the server');
				}

				spinner.text = getConnectingToPortMessage(newPortNumber);
				spinner.start();
				abortController = waitForPort({ portNumber: newPortNumber });
			}
		};

		const waitForPort = ({ portNumber }: { portNumber: number }) => {
			const abortController = new AbortController();

			getHostOfLocalPort({
				abortController,
				port: portNumber,
			})
				.then((host) => {
					process.stdin.off('data', onData);
					resolve({ portNumber, host });
				})
				.catch(() => {});

			return abortController;
		};

		abortController = waitForPort({
			portNumber: initialLocalServicePortNumber,
		});

		process.stdin.setRawMode(true);

		process.stdin.on('data', onData);
	});

	process.stdin.setRawMode(false);

	spinner.succeed(
		`Connected to local port ${chalk.green(localServicePortNumber)}!`,
	);

	return {
		finalLocalServicePortNumber: localServicePortNumber,
		localApplicationLocalAddress,
	};
}
