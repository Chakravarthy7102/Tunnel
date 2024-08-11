import { commandConvert, getEnvVars, parseCommand } from '#utils/command.ts';
import { supportMessage } from '#utils/message.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import { parseActorString } from '@-/actor';
import { prependBinStubsPaths } from '@-/bin-stubs';
import { getTunnelCliSourceDirpath } from '@-/cli-source/dirpath';
import { getCliStorage } from '@-/cli-storage';
import {
	DotTunnelJsonFileManager,
	getLocalProjectDotTunnelJsonFilepath,
} from '@-/dot-tunnel-json';
import { APP_ENV, RELEASE } from '@-/env/app';
import { HostEnvironmentType } from '@-/host-environment';
import {
	getLocalProjectEnvironment,
	getLocalProjectGitMetadata,
	getLocalProjectRootDirpath,
} from '@-/local-project';
import { logger } from '@-/logger';
import {
	createLocalProxyContext,
	startLocalProxyServer,
} from '@-/tunnel-instance-local-proxy-server';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { getLocalProjectTunnelYamlConfigFilepath } from '@-/tunnel-yaml-config';
import arg from 'arg';
import chalk from 'chalk';
import { ok } from 'errok';
import getPort from 'get-port';
import logSymbols from 'log-symbols';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import open from 'open';
import pWaitFor from 'p-wait-for';
import path from 'pathe';
import { onExit } from 'signal-exit';
import * as si from 'systeminformation';
import yaml from 'yaml';

// eslint-disable-next-line complexity -- complex function
export async function runWrapperCommand({
	argv,
}: {
	argv: string[];
}) {
	const args = arg(
		{
			'--project': String,
			'-p': '--project',
		},
		// Parse all the args before the "--" seperator
		{ argv: argv.slice(0, argv.indexOf('--')) },
	);

	const portOrUndefined = args._[0];
	const portStringColor: keyof typeof chalk = 'cyan';
	const commandStringColor: keyof typeof chalk = 'blue';

	let passthroughCommandArgs: string[];

	if (argv.includes('--')) {
		passthroughCommandArgs = argv.slice(argv.indexOf('--') + 1);
	} else {
		passthroughCommandArgs = [];
	}

	const errorMessageLines: string[] = [];

	const isPortNaN = portOrUndefined !== undefined &&
		Number.isNaN(Number(portOrUndefined));

	if (isPortNaN) {
		errorMessageLines.push(
			`${logSymbols.error} The ${
				chalk[portStringColor](
					'port number',
				)
			} passed to \`${
				chalk.bold(
					'tunnel',
				)
			}\` must be a valid number ${
				chalk.red.dim(
					`(received "${portOrUndefined}")`,
				)
			}`,
		);
	}

	// If either the passthrough command or the port is not specified, we exit with an error
	// However, we want to customize the error message based on what was passed to the command
	if (passthroughCommandArgs.length === 0 || portOrUndefined === undefined) {
		if (isPortNaN) {
			errorMessageLines.push('');
		}

		const bannerString =
			passthroughCommandArgs.length === 0 && portOrUndefined === undefined ?
				`${chalk.dim('`')}${chalk.bold('tunnel')}${
					chalk.dim(
						'`',
					)
				} needs a ${
					chalk[portStringColor](
						'port number',
					)
				} to listen on and a ${chalk[commandStringColor]('command')} to run:` :
				portOrUndefined === undefined ?
				`${chalk.dim('`')}${chalk.bold('tunnel')}${
					chalk.dim(
						'`',
					)
				} needs a ${chalk[portStringColor]('port number')} to listen on:` :
				`${chalk.dim('`')}${chalk.bold('tunnel')}${chalk.dim('`')} ${
					isPortNaN ? 'also ' : ''
				}needs a ${chalk[commandStringColor]('command')} to run:`;

		errorMessageLines.push(bannerString);

		if (passthroughCommandArgs.length === 0 || portOrUndefined === undefined) {
			const exampleCommandString = `tunnel ${
				chalk[portStringColor](
					portOrUndefined !== undefined && !isPortNaN ?
						portOrUndefined :
						chalk.bold.underline(chalk.dim('<') + 'port' + chalk.dim('>')),
				)
			} -- ${
				chalk[commandStringColor](
					passthroughCommandArgs.length === 0 ?
						chalk.bold.underline(chalk.dim('<') + 'command' + chalk.dim('>')) :
						passthroughCommandArgs,
				)
			}`;

			// dprint-ignore
			errorMessageLines.push(
				'',
				'    ' + exampleCommandString,
				''
			)

			if (portOrUndefined === undefined || isPortNaN) {
				errorMessageLines.push(
					`${logSymbols.info} The ${
						chalk[portStringColor](
							'port number',
						)
					} is the 4 or 5 digits in your app's ${
						chalk.dim(
							'`',
						)
					}localhost:${
						chalk.green(
							chalk.dim('[') + 'PORT' + chalk.dim(']'),
						)
					}${chalk.dim('`')} URL`,
				);
			}

			if (passthroughCommandArgs.length === 0) {
				errorMessageLines.push(
					`${chalk.green(chalk.reset(logSymbols.info))} The ${
						chalk[
							commandStringColor
						](
							'command',
						)
					} is the command you normally use to run your app (${
						chalk.dim(
							'e.g.',
						)
					} \`npm run dev\`)`,
				);
			}

			errorMessageLines.push('', supportMessage);
		}
	}

	if (errorMessageLines.length > 0) {
		process.stderr.write(errorMessageLines.join('\n') + '\n');
		process.exit(1);
	}

	/** We generate a random port for the local application to bind to */
	const localServicePortNumber = await getPort();
	const localTunnelProxyServerPortNumber = Number(portOrUndefined);

	// If there is a tunnel instance, we should update it

	const tunnelCliSourceDirpath = getTunnelCliSourceDirpath({
		release: RELEASE,
		version: tunnelPublicPackagesMetadata['@tunnel/cli'].version,
	});
	const localProjectWorkingDirpath = process.cwd();
	const { localProjectRootDirpath, reasonMessage } =
		await getLocalProjectRootDirpath({
			workingDirpath: localProjectWorkingDirpath,
		});
	const localProjectGitMetadata = await getLocalProjectGitMetadata({
		localProjectRootDirpath,
	});
	process.stdout.write(reasonMessage);
	const localProjectEnvironment = await getLocalProjectEnvironment({
		localServicePortNumber,
		localTunnelProxyServerPortNumber,
		localProjectRootDirpath,
		localProjectWorkingDirpath,
		tunnelCliSourceDirpath,
		providedProjectId: args['--project'] ?? null,
		localProjectGitMetadata,
	});

	const tunnelYamlConfigFilepath = getLocalProjectTunnelYamlConfigFilepath({
		localProjectRootDirpath,
	});

	const tunnelYamlConfig = fs.existsSync(tunnelYamlConfigFilepath) ?
		yaml.parse(await fs.promises.readFile(tunnelYamlConfigFilepath, 'utf8')) :
		null;

	// const gitUrl = await getLocalProjectGitUrl({ localProjectRootDirpath });
	// logger.info('[tunnel.dev] Using Git URL %s', gitUrl);

	// TODO: do this when we re-add click-to-code
	// const nextCacheDirpath = path.join(localProjectRootDirpath, '.next');

	// // In case the project has a cache (e.g. `.next`), we need to delete it if it wasn't cached when Tunnel was running
	// if (
	// 	fs.existsSync(nextCacheDirpath) &&
	// 	!fs.existsSync(path.join(nextCacheDirpath, '__tunnel.json'))
	// ) {
	// 	await fs.promises.rm(nextCacheDirpath, { recursive: true });
	// 	await fs.promises.mkdir(nextCacheDirpath, { recursive: true });
	// 	await fs.promises.writeFile(
	// 		path.join(nextCacheDirpath, '__tunnel.json'),
	// 		JSON.stringify({})
	// 	);
	// }

	// const webpackCacheDirpath = path.join(
	// 	localProjectDirpath,
	// 	'node_modules/.cache'
	// );

	// if (
	// 	fs.existsSync(webpackCacheDirpath) &&
	// 	!fs.existsSync(path.join(webpackCacheDirpath, '__tunnel.json'))
	// ) {
	// 	await fs.promises.rm(webpackCacheDirpath, { recursive: true });
	// 	await fs.promises.mkdir(webpackCacheDirpath, { recursive: true });
	// 	await fs.promises.writeFile(
	// 		path.join(webpackCacheDirpath, '__tunnel.json'),
	// 		JSON.stringify({})
	// 	);
	// }

	const shouldUseDoubleUnderscorePortConstant = passthroughCommandArgs.some(
		(arg) => arg.match(/\b__PORT__\b/),
	);
	const processedPassthroughCommand = passthroughCommandArgs.map((arg) => {
		if (arg.endsWith('=PORT')) {
			return arg.replace(/=PORT$/, `=${String(localServicePortNumber)}`);
		}

		return arg.replaceAll(
			shouldUseDoubleUnderscorePortConstant ? /\b__PORT__\b/g : /\bPORT\b/g,
			String(localServicePortNumber),
		);
	});
	const [envSetters, command, commandArgs] = parseCommand(
		processedPassthroughCommand,
	);
	const env = getEnvVars(envSetters);

	const tunnelAppProcess = spawn(
		// Taken from https://github.com/kentcdodds/cross-env/blob/master/index.js#L14C7-L17C56
		commandConvert(command as string, env, true),
		commandArgs.map((arg) => commandConvert(arg, env)),
		{
			shell: true,
			env: {
				...env,
				PATH: prependBinStubsPaths(
					RELEASE === null ?
						{
							pathEnv: process.env.PATH ?? '',
							release: null,
							monorepoDirpath: path.normalize(
								process.env.TUNNEL_MONOREPO_DIRPATH ??
									(() => {
										throw new Error(
											'TUNNEL_MONOREPO_DIRPATH must be set in the environment for a development release',
										);
									})(),
							),
						} :
						{
							pathEnv: process.env.PATH ?? '',
							release: RELEASE,
							tunnelCliSourceDirpath,
						},
				),
				TUNNEL_RELEASE: RELEASE ?? 'development',
				TUNNEL_LOCAL_PROJECT_ENVIRONMENT: JSON.stringify(
					localProjectEnvironment,
				),
				TUNNEL_YAML_CONFIG: JSON.stringify(tunnelYamlConfig),
				...(APP_ENV === 'development' ?
					{
						TUNNEL_MONOREPO_DIRPATH: path.normalize(
							process.env.TUNNEL_MONOREPO_DIRPATH ??
								(() => {
									throw new Error(
										'TUNNEL_MONOREPO_DIRPATH must be set in the environment for a development release',
									);
								})(),
						),
					} :
					{}),
				TUNNEL_PORT: String(localServicePortNumber),
			},
			stdio: 'inherit',
		},
	);

	// Prevents an infinite loop
	let isMainProcessKilled = false;
	let isTunnelAppProcessKilled = false;

	void tunnelAppProcess.on('exit', (exitCode) => {
		if (!isMainProcessKilled) {
			isTunnelAppProcessKilled = true;
			process.exit(exitCode ?? 0);
		}
	});

	onExit(() => {
		if (!isTunnelAppProcessKilled) {
			isMainProcessKilled = true;
			logger.debug('Killing tunnel app process');
			tunnelAppProcess.kill();
		}
	});

	const connection = await pWaitFor(
		async () => {
			const connections = await si.networkConnections();

			const connection = connections.find(
				(connection) =>
					connection.localPort === localServicePortNumber.toString(),
			);

			if (connection === undefined) {
				return false;
			}

			return pWaitFor.resolveWith(connection);
		},
		{ interval: 1000 },
	);

	const context = createLocalProxyContext({
		localProjectEnvironment,
		// For the wrapper command, authentication is handled by the browser
		// The `actor` and `accessToken` properties will
		// automatically be populated when a request with authentication
		// credentials is sent to the proxy server
		actor: null,
		hostEnvironment: {
			type: HostEnvironmentType.wrapperCommand,
			localProjectEnvironment,
		},
		localProjectRuntime: {
			localApplicationLocalAddress: connection.localAddress === '*' ?
				'localhost' :
				connection.localAddress === '::1' ?
				'localhost' :
				connection.localAddress,
		},
	});

	const cliStorage = getCliStorage();
	const { currentActorString } = await cliStorage.get();

	if (currentActorString !== null) {
		const actor = parseActorString(currentActorString);
		const dotTunnelJsonFilepath = getLocalProjectDotTunnelJsonFilepath({
			localProjectRootDirpath,
		});

		const dotTunnelJsonFileManager = (await DotTunnelJsonFileManager.create({
			dotTunnelJsonFilepath,
		})).unwrapOrThrow();

		const localWorkspace = await dotTunnelJsonFileManager.getLocalWorkspace({
			actorUserId: actor.data.id,
			relativeDirpath: path.relative(
				localProjectRootDirpath,
				localProjectWorkingDirpath,
			),
		});

		if (localWorkspace?.linkedTunnelInstanceProxyPreviewId) {
			const { webappTrpc } = await getWebappTrpc();
			try {
				const result = await webappTrpc.tunnelInstanceProxyPreview.update
					.mutate({
						actor,
						tunnelInstanceProxyPreview: {
							id: localWorkspace.linkedTunnelInstanceProxyPreviewId,
						},
						updates: {
							localServicePortNumber,
							localTunnelProxyServerPortNumber,
						},
					});
				// eslint-disable-next-line max-depth -- TODO
				if (result.isErr()) {
					logger.error(
						'Failed to update tunnel instance proxy preview',
						result.error,
					);
				}
			} catch {}
		}
	}

	await startLocalProxyServer({ context });

	if (argv.includes('--open') || argv.includes('-o')) {
		await open(`http://localhost:${localServicePortNumber}`);
	}

	return ok({ exit: false });
}
