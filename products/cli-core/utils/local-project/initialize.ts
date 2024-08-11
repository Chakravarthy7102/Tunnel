import { getLocalProjectGitUrl } from '#utils/git.ts';
import { promptLocalServicePort } from '#utils/port.ts';
import { getWebappTrpc } from '#utils/trpc.ts';
import type { Actor } from '@-/actor';
import { getConvex } from '@-/convex/cli';
import { type Id } from '@-/database';
import { getVapi } from '@-/database/vapi';
import {
	DotTunnelJsonFileManager,
	getLocalProjectDotTunnelJsonFilepath,
} from '@-/dot-tunnel-json';
import type { ProjectGitMetadata } from '@-/git-metadata';
import { logger } from '@-/logger';
import chalk from 'chalk';
import { $try, type TryOk } from 'errok';
import fs from 'node:fs';
import path from 'pathe';
import {
	getGithubRepositoryToLink,
	promptCreateFirstProject,
	promptSelectProject,
	promptUninitializedLocalProjectAction,
} from './project.ts';
import { createNewTunnelInstanceProxyPreview } from './tunnel-instance-proxy-preview.ts';
import { getOrCreateUserLocalWorkspace } from './user-local-workspace.ts';

/**
	Initialize a local project for the first time by creating a new `.tunnel.json` file. We also create a local workspace for the local project, and prompt the user for configuration options.
*/
export const initializeLocalProjectAndWorkspace = ({
	localProjectRootDirpath,
	localProjectWorkingDirpath,
	localTunnelProxyServerPortNumber,
	providedLocalServicePortNumber,
	providedOrganizationSlug,
	localProjectGitMetadata,
	actor,
	actorUserId,
}: {
	localProjectRootDirpath: string;
	localProjectWorkingDirpath: string;
	providedLocalServicePortNumber: number | null;
	localTunnelProxyServerPortNumber: number;
	providedOrganizationSlug: string | null;
	localProjectGitMetadata: ProjectGitMetadata | null;
	actor: Actor<'User'>;
	actorUserId: Id<'User'>;
}) => ($try(async function*(
	$ok: TryOk<{
		linkedTunnelInstanceProxyPreview: {
			_id: Id<'TunnelInstanceProxyPreview'>;
			localServicePortNumber: number;
		};
		projectId: Id<'Project'>;
		organizationId: Id<'Organization'>;
		userLocalWorkspaceId: Id<'UserLocalWorkspace'>;
		localServicePortNumber: number;
	}>,
) {
	const { webappTrpc } = await getWebappTrpc();

	process.stdout.write(
		chalk.bold.italic(
			'⚙️  Tunnel has not been initialized for this app, attempting to setup now...\n\n',
		),
	);

	const { projectId, organizationId } = yield* (await $try(async function*() {
		const hasCreatedProject =
			yield* (await webappTrpc.user.hasCreatedProject.query({
				actor,
				user: {
					id: actor.data.id,
				},
			})).safeUnwrap();

		// If the user has not created a project yet, we should create a new project and a new local workspace for them
		if (!hasCreatedProject) {
			return promptCreateFirstProject({
				actor,
				localProjectRootDirpath,
				localProjectWorkingDirpath,
				providedOrganizationSlug,
				localProjectGitMetadata,
			});
		}

		// Otherwise, we ask the user whether they want to create a new project or link this local project to an existing one.
		const uninitializedLocalProjectAction =
			yield* promptUninitializedLocalProjectAction()
				.safeUnwrap();
		if (uninitializedLocalProjectAction === 'createNewProject') {
			return promptCreateFirstProject({
				actor,
				localProjectRootDirpath,
				localProjectWorkingDirpath,
				providedOrganizationSlug,
				localProjectGitMetadata,
			});
		} else {
			return promptSelectProject({
				actor,
				localProjectRootDirpath,
				localProjectWorkingDirpath,
				canCreateNewProject: false,
				providedOrganizationSlug,
				localProjectGitMetadata,
			});
		}
	})).safeUnwrap();

	let { userLocalWorkspaceId, linkedTunnelInstanceProxyPreview } =
		yield* getOrCreateUserLocalWorkspace({
			projectId,
			actorUserId,
			localProjectRootDirpath,
			localProjectWorkingDirpath,
		}).safeUnwrap();

	let localServicePortNumber: number;

	// If the local workspace doesn't have a linked tunnel instance proxy preview, we create a new one
	if (linkedTunnelInstanceProxyPreview === null) {
		logger.debug(
			'User local workspace does not have a linked tunnel instance proxy preview, creating new one...',
		);
		const gitUrl = await getLocalProjectGitUrl({
			localProjectRootDirpath,
		});

		// If the port isn't provided, we prompt the user for a port number
		localServicePortNumber = providedLocalServicePortNumber ??
			(await promptLocalServicePort());

		const { tunnelInstanceProxyPreviewId } =
			await createNewTunnelInstanceProxyPreview({
				actor,
				projectId,
				userLocalWorkspaceId,
				gitUrl,
				localServicePortNumber,
				localServiceOriginalPortNumber: localServicePortNumber,
				localTunnelProxyServerPortNumber,
			});

		try {
			const convex = await getConvex({ actorUserId });
			const vapi = await getVapi();
			await convex.mutation(vapi.v.UserLocalWorkspace_update, {
				input: {
					id: userLocalWorkspaceId,
					updates: {
						linkedTunnelInstanceProxyPreview: tunnelInstanceProxyPreviewId,
					},
				},
			});
		} catch {
			process.stderr.write('Failed to update user local workspace\n');
		}

		linkedTunnelInstanceProxyPreview = {
			_id: tunnelInstanceProxyPreviewId,
			localServicePortNumber,
		};
	} else {
		localServicePortNumber =
			linkedTunnelInstanceProxyPreview.localServicePortNumber;
	}

	const dotTunnelJsonFileManager = yield* DotTunnelJsonFileManager.create({
		dotTunnelJsonFilepath: getLocalProjectDotTunnelJsonFilepath({
			localProjectRootDirpath,
		}),
	}).safeUnwrap();

	await dotTunnelJsonFileManager.addLocalWorkspace({
		relativeDirpath: path.relative(
			localProjectRootDirpath,
			localProjectWorkingDirpath,
		),
		projectId,
		userId: actor.data.id,
		linkedTunnelInstanceProxyPreviewId: linkedTunnelInstanceProxyPreview._id,
		userLocalWorkspaceId,
	});

	process.stdout.write(
		'\n' +
			chalk.magentaBright.bold(`✨ Tunnel has been successfully set up!\n`),
	);
	process.stdout.write(
		chalk.blue(
			`🚀 Next time, you can run ${
				chalk.yellow(
					'tunnel share .',
				)
			} from this directory to instantly start your tunnel\n\n`,
		),
	);

	return $ok({
		linkedTunnelInstanceProxyPreview,
		projectId,
		organizationId,
		localServicePortNumber,
		userLocalWorkspaceId,
	});
}));

/**
	@param args
	@param args.providedLocalServicePortNumber - The port number that is provided via the CLI; otherwise we prompt the user for the port number.
*/
export const getOrCreateLocalWorkspace = ({
	localProjectRootDirpath,
	localProjectWorkingDirpath,
	localTunnelProxyServerPortNumber,
	providedLocalServicePortNumber,
	providedOrganizationSlug,
	actor,
	actorUserId,
	localProjectGitMetadata,
}: {
	localProjectRootDirpath: string;
	localProjectWorkingDirpath: string;
	localTunnelProxyServerPortNumber: number;
	providedLocalServicePortNumber: number | null;
	providedOrganizationSlug: string | null;
	localProjectGitMetadata: ProjectGitMetadata | null;
	actor: Actor<'User'>;
	actorUserId: Id<'User'>;
}) => ($try(async function*(
	$ok: TryOk<{
		userLocalWorkspaceId: Id<'UserLocalWorkspace'>;
		organizationId: Id<'Organization'>;
		projectId: Id<'Project'>;
		linkedTunnelInstanceProxyPreview: {
			_id: Id<'TunnelInstanceProxyPreview'>;
			localServicePortNumber: number;
		};
	}>,
) {
	const { webappTrpc } = await getWebappTrpc();

	const localProjectDotTunnelJsonFilepath =
		getLocalProjectDotTunnelJsonFilepath({
			localProjectRootDirpath,
		});

	// If the `.tunnel.json` file doesn't exist, we should initialize a new local project and workspace
	if (!fs.existsSync(localProjectDotTunnelJsonFilepath)) {
		return initializeLocalProjectAndWorkspace({
			actor,
			actorUserId,
			localProjectRootDirpath,
			localProjectWorkingDirpath,
			providedLocalServicePortNumber,
			providedOrganizationSlug,
			localTunnelProxyServerPortNumber,
			localProjectGitMetadata,
		});
	}

	// If the `.tunnel.json` file does exist, we should use it
	const dotTunnelJsonFileManager = yield* DotTunnelJsonFileManager.create({
		dotTunnelJsonFilepath: localProjectDotTunnelJsonFilepath,
	}).safeUnwrap();

	const relativeDirpath = path.relative(
		localProjectRootDirpath,
		localProjectWorkingDirpath,
	);

	// We check if this `.tunnel.json` already has a local workspace registered to this relative dirpath
	const localWorkspace = await dotTunnelJsonFileManager.getLocalWorkspace({
		relativeDirpath,
		actorUserId: actor.data.id,
	});

	// If we can't find a local workspace saved in the `.tunnel.json` file, then we should initialize a new local project and workspace
	if (localWorkspace === undefined) {
		logger.debug(
			'User local workspace not found in `.tunnel.json`, initializing new one',
		);
		return initializeLocalProjectAndWorkspace({
			actor,
			actorUserId,
			localProjectRootDirpath,
			localProjectWorkingDirpath,
			providedLocalServicePortNumber,
			localTunnelProxyServerPortNumber,
			providedOrganizationSlug,
			localProjectGitMetadata,
		});
	}

	const convex = await getConvex({ actorUserId });
	const vapi = await getVapi();
	const userLocalWorkspace = await (async () => {
		try {
			return await convex.query(
				vapi.v.UserLocalWorkspace_get_initializeData,
				{
					input: {
						from: localWorkspace.userLocalWorkspaceId,
					},
				},
			);
		} catch {
			return null;
		}
	})();

	// If the user local workspace does not exist anymore, we should delete it and initialize a new one
	if (userLocalWorkspace === null) {
		logger.debug(
			'User local workspace not found in database, initializing new one',
		);
		await dotTunnelJsonFileManager.deleteLocalWorkspace({
			relativeDirpath,
			actorUserId: actor.data.id,
		});
		return initializeLocalProjectAndWorkspace({
			actor,
			actorUserId,
			localProjectRootDirpath,
			localProjectWorkingDirpath,
			providedLocalServicePortNumber,
			localTunnelProxyServerPortNumber,
			providedOrganizationSlug,
			localProjectGitMetadata,
		});
	}

	let linkedTunnelInstanceProxyPreview: {
		_id: Id<'TunnelInstanceProxyPreview'>;
		localServicePortNumber: number;
	};
	// If there isn't a linked tunnel instance proxy preview, we should create one
	if (userLocalWorkspace.linkedTunnelInstanceProxyPreview === null) {
		logger.debug(
			'User local workspace found, but does not have a linked tunnel instance proxy preview, creating new one...',
		);

		const gitUrl = await getLocalProjectGitUrl({
			localProjectRootDirpath,
		});

		const localServicePortNumber = providedLocalServicePortNumber ??
			(await promptLocalServicePort());

		const { tunnelInstanceProxyPreviewId } =
			await createNewTunnelInstanceProxyPreview({
				actor,
				projectId: userLocalWorkspace.project._id,
				userLocalWorkspaceId: userLocalWorkspace._id,
				gitUrl,
				localServicePortNumber,
				localServiceOriginalPortNumber: localServicePortNumber,
				localTunnelProxyServerPortNumber,
			});

		const convex = await getConvex({ actorUserId });
		const vapi = await getVapi();
		try {
			await convex.mutation(vapi.v.UserLocalWorkspace_update, {
				input: {
					id: userLocalWorkspace._id,
					updates: {
						linkedTunnelInstanceProxyPreview: tunnelInstanceProxyPreviewId,
					},
				},
			});
		} catch {
			process.stderr.write('Failed to update user local workspace\n');
		}

		linkedTunnelInstanceProxyPreview = {
			_id: tunnelInstanceProxyPreviewId,
			localServicePortNumber,
		};
	} else {
		linkedTunnelInstanceProxyPreview =
			userLocalWorkspace.linkedTunnelInstanceProxyPreview;
	}

	// If the user local workspace was found in the database, but not locally, we should prompt the user if they wan to link a GitHub repository to the project
	const githubRepository = await getGithubRepositoryToLink({
		organization: userLocalWorkspace.project.organization,
		actor,
		localProjectGitMetadata,
		project: userLocalWorkspace.project,
	}).unwrapOr(null);
	if (githubRepository !== null) {
		const result = await webappTrpc.project.update.mutate({
			actor,
			project: {
				id: userLocalWorkspace.project._id,
			},
			updates: {
				githubRepository,
			},
		});

		if (result.isErr()) {
			process.stderr.write(
				`Failed to link GitHub repository to project: ${result.error.message}\n`,
			);
		}
	}

	return $ok({
		userLocalWorkspaceId: userLocalWorkspace._id,
		projectId: userLocalWorkspace.project._id,
		organizationId: userLocalWorkspace.project.organization._id,
		linkedTunnelInstanceProxyPreview,
	});
}));
