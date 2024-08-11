import { defineProcedure } from '#utils/procedure.ts';
import { idSchema } from '@-/database/schemas';
import {
	DotTunnelJsonFileManager,
	getLocalProjectDotTunnelJsonFilepath,
} from '@-/dot-tunnel-json';
import { ProcedureError } from '@-/errors';
import { z } from '@-/zod';
import { $try, ok } from 'errok';

/**
	Saves a user local workspace to `.tunnel.json`
*/
export const userLocalWorkspace_save = defineProcedure({
	input: z.object({
		userLocalWorkspaceId: idSchema('UserLocalWorkspace'),
		relativeDirpath: z.string(),
		userId: idSchema('User'),
		projectId: idSchema('Project'),
		linkedTunnelInstanceProxyPreviewId: idSchema('TunnelInstanceProxyPreview')
			.nullable(),
	}),
	mutation: async ({
		input: {
			relativeDirpath,
			userId,
			projectId,
			linkedTunnelInstanceProxyPreviewId,
			userLocalWorkspaceId,
		},
		ctx: { context },
	}) => ($try(async function*() {
		const dotTunnelJsonFilepath = getLocalProjectDotTunnelJsonFilepath({
			localProjectRootDirpath:
				context.state.localProjectEnvironment.rootDirpath,
		});

		const dotTunnelJsonManager = yield* DotTunnelJsonFileManager.create({
			dotTunnelJsonFilepath,
		}).safeUnwrap();

		await dotTunnelJsonManager.addLocalWorkspace({
			userLocalWorkspaceId,
			relativeDirpath,
			userId,
			projectId,
			linkedTunnelInstanceProxyPreviewId,
		});

		await dotTunnelJsonManager.setActiveLocalWorkspace({
			relativeDirpath,
			userId,
			userLocalWorkspaceId,
		});

		context.state.userLocalWorkspaceId = userLocalWorkspaceId;

		return ok();
	})),
	error: ({ error }) =>
		new ProcedureError(
			'There was an error saving workspace data',
			error,
		),
});

export const userLocalWorkspace_getActive = defineProcedure({
	input: z.object({
		actorUserId: idSchema('User'),
		relativeDirpath: z.string(),
	}),
	query: async ({
		input: { actorUserId, relativeDirpath },
		ctx: { context },
	}) => ($try(async function*() {
		const dotTunnelJsonFilepath = getLocalProjectDotTunnelJsonFilepath({
			localProjectRootDirpath:
				context.state.localProjectEnvironment.rootDirpath,
		});

		const dotTunnelJsonManager = yield* DotTunnelJsonFileManager.create({
			dotTunnelJsonFilepath,
		}).safeUnwrap();

		const userLocalWorkspace = await dotTunnelJsonManager
			.getActiveLocalWorkspace({
				userId: actorUserId,
				relativeDirpath,
			});

		return ok(userLocalWorkspace);
	})),
	error: ({ error }) =>
		new ProcedureError(
			'There was an error saving workspace data',
			error,
		),
});
