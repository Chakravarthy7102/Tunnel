import { getUserLocalWorkspaceInputSchema } from '#schemas/input.ts';
import { userLocalWorkspaceInputValidator } from '#validators/input.ts';
import { v } from '@-/convex/values';
import type { SelectionInput, SelectionOutput } from '@-/database';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	dbPatch,
	defineMutation,
	defineQuery,
} from '@-/database/function-utils';
import { getIdSchema } from '@-/database/schemas';
import { getInclude } from '@-/database/selection-utils';
import {
	UserLocalWorkspace_$initializeData,
	UserLocalWorkspace_$linkedTunnelInstanceProxyPreviewData,
	UserLocalWorkspace_$linkedTunnelInstanceProxyPreviewWithProjectLivePreviewsData,
	UserLocalWorkspace_$recursiveTunneledServiceEnvironmentData,
	UserLocalWorkspace_$userData,
} from '@-/database/selections';
import { UnexpectedError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { getProjectIdSchema } from '@-/project/schemas';
import { getTunnelInstanceProxyPreviewIdSchema } from '@-/tunnel-instance-proxy-preview/schemas';
import { getUserIdSchema } from '@-/user/schemas';
import { z } from '@-/zod';
import { vNullable } from 'corvex';

const defineInsertMutation = <$S extends SelectionInput>(
	selection: $S,
) => (defineMutation({
	table: 'UserLocalWorkspace',
	input: v.object({
		user: v.id('User'),
		project: v.id('Project'),
		relativeDirpath: v.string(),
		linkedTunnelInstanceProxyPreview: vNullable(
			v.id('TunnelInstanceProxyPreview'),
		),
	}),
	schema: (ctx, args) => (z.object({
		user: getUserIdSchema(ctx, args, { actorRelation: 'actor' }),
		project: getProjectIdSchema(ctx, args, {
			actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
		}),
		relativeDirpath: z.string(),
		linkedTunnelInstanceProxyPreview: getTunnelInstanceProxyPreviewIdSchema(
			ctx,
			args,
			{ actorRelation: 'creator' },
		).nullable(),
	})),
	async handler(ctx, { input }) {
		const _id = await dbInsert(ctx, 'UserLocalWorkspace', input, {
			unique: {
				by_project_relativeDirpath_user: ['project', 'relativeDirpath', 'user'],
			},
		});
		return await applyInclude(
			ctx,
			'UserLocalWorkspace',
			_id,
			getInclude(selection),
		) as SelectionOutput<'UserLocalWorkspace', $S>;
	},
	error: (error) =>
		new UnexpectedError('while creating the user local workspace', {
			cause: error,
		}),
}));

export const UserLocalWorkspace_insert = defineInsertMutation({});
export const UserLocalWorkspace_insert_linkedProxyPreviewData =
	defineInsertMutation(
		UserLocalWorkspace_$linkedTunnelInstanceProxyPreviewData,
	);
export const UserLocalWorkspace_insert_linkedProxyPreviewWithLivePreviewsData =
	defineInsertMutation(
		UserLocalWorkspace_$linkedTunnelInstanceProxyPreviewWithProjectLivePreviewsData,
	);
export const UserLocalWorkspace_insert_recurTunneledServiceEnvironmentData =
	defineInsertMutation(
		UserLocalWorkspace_$recursiveTunneledServiceEnvironmentData,
	);

const defineGetQuery = <$S extends SelectionInput>(
	selection: $S,
) => (defineQuery({
	table: 'UserLocalWorkspace',
	input: v.object({
		from: userLocalWorkspaceInputValidator,
	}),
	schema: (ctx, args) => (z.object({
		from: getUserLocalWorkspaceInputSchema(ctx, args, {
			actorRelation: 'actor',
		}),
	})),
	async handler(ctx, { input: { from } }) {
		return await applyInclude(
			ctx,
			'UserLocalWorkspace',
			from,
			getInclude(selection),
		) as SelectionOutput<'UserLocalWorkspace', $S> | null;
	},
	error: (error) =>
		new UnexpectedError('while retrieving the user local workspace', {
			cause: error,
		}),
}));

export const UserLocalWorkspace_get = defineGetQuery({});
export const UserLocalWorkspace_get_userData = defineGetQuery(
	UserLocalWorkspace_$userData,
);
export const UserLocalWorkspace_get_initializeData = defineGetQuery(
	UserLocalWorkspace_$initializeData,
);
export const UserLocalWorkspace_get_linkedProxyPreviewData = defineGetQuery(
	UserLocalWorkspace_$linkedTunnelInstanceProxyPreviewData,
);
export const UserLocalWorkspace_get_linkedProxyPreviewWithLivePreviewsData =
	defineGetQuery(
		UserLocalWorkspace_$linkedTunnelInstanceProxyPreviewWithProjectLivePreviewsData,
	);
export const UserLocalWorkspace_get_recursiveTunneledServiceEnvironmentData =
	defineGetQuery(
		UserLocalWorkspace_$recursiveTunneledServiceEnvironmentData,
	);

export const UserLocalWorkspace_update = defineMutation({
	table: 'UserLocalWorkspace',
	input: v.object({
		id: v.id('UserLocalWorkspace'),
		updates: v.object({
			linkedTunnelInstanceProxyPreview: v.optional(
				v.id('TunnelInstanceProxyPreview'),
			),
		}),
	}),
	schema: (ctx, args) => (z.object({
		id: getIdSchema(ctx, 'UserLocalWorkspace'),
		updates: z.object({
			linkedTunnelInstanceProxyPreview: z.optional(
				getTunnelInstanceProxyPreviewIdSchema(ctx, args, {
					actorRelation: 'creator',
				}),
			),
		}),
	})),
	async handler(ctx, { input: { updates, id } }) {
		return dbPatch(
			ctx,
			'UserLocalWorkspace',
			id,
			updates,
			{ unique: {} },
		);
	},
	error: (error) =>
		new UnexpectedError('while updating the user local workspace', {
			cause: error,
		}),
});

export const UserLocalWorkspace_delete = defineMutation({
	table: 'UserLocalWorkspace',
	input: v.object({
		userLocalWorkspace: userLocalWorkspaceInputValidator,
	}),
	schema: (ctx, args) => (z.object({
		userLocalWorkspace: getUserLocalWorkspaceInputSchema(ctx, args, {
			actorRelation: 'actor',
		}),
	})),
	async handler(ctx, { input: { userLocalWorkspace } }) {
		await dbDelete(ctx, 'UserLocalWorkspace', userLocalWorkspace);
	},
	error: (error) =>
		new UnexpectedError('while deleting the user local workspace', {
			cause: error,
		}),
});
