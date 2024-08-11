import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import type { Selection } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	TunnelInstanceProxyPreview_$dashboardPageData,
	TunnelInstanceProxyPreview_$projectLivePreviewsData,
	TunnelInstanceProxyPreview_$publicData,
	TunnelInstanceProxyPreview_$recursiveTunneledServiceEnvironmentData,
	TunnelInstanceProxyPreview_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { ApiTunnelInstanceProxyPreview } from '@-/tunnel-instance-proxy-preview/api';
import { z } from '@-/zod';
import { $try, ok } from 'errok';
import type { EmptyObject } from 'type-fest';

const buildCreateProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			createdByUser: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			gitUrl: z.string().nullable(),
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
			})(input, ctx),
			localServicePortNumber: z.number(),
			localServiceOriginalPortNumber: z.number(),
			localTunnelProxyServerPortNumber: z.number(),
			userLocalWorkspace: WebappApiInput.userLocalWorkspace({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const createdByUserId = yield* input.createdByUser.safeUnwrap();
		const projectId = yield* input.project.safeUnwrap();
		const {
			gitUrl,
			localServicePortNumber,
			localServiceOriginalPortNumber,
			localTunnelProxyServerPortNumber,
		} = input;
		return ApiTunnelInstanceProxyPreview.create({
			input: {
				data: {
					createdByUser: createdByUserId,
					project: projectId,
					gitUrl,
					localServicePortNumber,
					localServiceOriginalPortNumber,
					localTunnelProxyServerPortNumber,
				},
				include: getInclude(selection),
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't share preview", error),
}));

/**
	Actor must be a user because the tunnel instance user doesn't exist yet.
*/
export const tunnelInstanceProxyPreview_create = buildCreateProcedure({});
export const tunnelInstanceProxyPreview_create$tunnelInstancePageToolbarData =
	buildCreateProcedure(
		TunnelInstanceProxyPreview_$tunnelInstancePageToolbarData,
	);

const buildGetProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			tunnelInstanceProxyPreview: WebappApiInput
				.tunnelInstanceProxyPreview({
					identifier: 'id',
					actor,
					actorRelation: 'creator',
				})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		if (
			input.tunnelInstanceProxyPreview.isErr() &&
			input.tunnelInstanceProxyPreview instanceof DocumentNotFoundError
		) {
			return ok(null);
		}

		const tunnelInstanceProxyPreviewId = yield* input
			.tunnelInstanceProxyPreview
			.safeUnwrap();
		return ApiConvex.v.TunnelInstanceProxyPreview.get({
			from: { id: tunnelInstanceProxyPreviewId },
			include: getInclude(selection),
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't share preview", error),
}));

export const tunnelInstanceProxyPreview_get = buildGetProcedure({});
export const tunnelInstanceProxyPreview_get$projectLivePreviewsData =
	buildGetProcedure(TunnelInstanceProxyPreview_$projectLivePreviewsData);
export const tunnelInstanceProxyPreview_get$dashboardPageData =
	buildGetProcedure(TunnelInstanceProxyPreview_$dashboardPageData);
export const tunnelInstanceProxyPreview_get$recursiveTunneledServiceEnvironmentData =
	buildGetProcedure(
		TunnelInstanceProxyPreview_$recursiveTunneledServiceEnvironmentData,
	);

const buildListProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			user: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const projectId = yield* input.project.safeUnwrap();
		const userId = yield* input.user.safeUnwrap();
		return ApiConvex.v.TunnelInstanceProxyPreview.list({
			include: getInclude(selection),
			where: {
				inProject: projectId,
				createdByUser: userId,
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't list previews", error),
}));

export const tunnelInstanceProxyPreview_list = buildListProcedure({});

export const tunnelInstanceProxyPreview_count = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			user: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const userId = yield* input.user.safeUnwrap();
		return ApiConvex.v.TunnelInstanceProxyPreview.count({
			where: {
				createdByUser: userId,
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't count previews", error),
});

export const tunnelInstanceProxyPreview_getPublicData = defineProcedure({
	input: (({ input, ctx }) =>
		z.object({
			tunnelInstanceProxyPreview: WebappApiInput.tunnelInstanceProxyPreview({
				identifier: 'id',
				actor: null,
				actorRelation: 'anyone',
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		if (
			input.tunnelInstanceProxyPreview.isErr() &&
			input.tunnelInstanceProxyPreview.error instanceof DocumentNotFoundError
		) {
			return ok(null);
		}

		const tunnelInstanceProxyPreviewId = yield* input
			.tunnelInstanceProxyPreview
			.safeUnwrap();
		return ApiConvex.v.TunnelInstanceProxyPreview.get({
			from: { id: tunnelInstanceProxyPreviewId },
			include: getInclude(TunnelInstanceProxyPreview_$publicData),
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't get preview", error),
});

export const tunnelInstanceProxyPreview_delete = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			tunnelInstanceProxyPreview: WebappApiInput.tunnelInstanceProxyPreview({
				identifier: 'id',
				actor,
				actorRelation: 'creator',
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const tunnelInstanceProxyPreviewId = yield* input
			.tunnelInstanceProxyPreview
			.safeUnwrap();
		return ApiConvex.v.TunnelInstanceProxyPreview.delete({
			input: {
				id: tunnelInstanceProxyPreviewId,
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't delete preview", error),
});

export const tunnelInstanceProxyPreview_update = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			tunnelInstanceProxyPreview: WebappApiInput.tunnelInstanceProxyPreview({
				identifier: 'id',
				actor,
				actorRelation: 'creator',
			})(input, ctx),
			updates: z.object({
				name: z.string().optional(),
				gitUrl: z.string().optional(),
				projectPath: z.string().nullable().optional(),
				localTunnelProxyServerPortNumber: z.number().optional(),
				localServicePortNumber: z.number().optional(),
				localServiceOriginalPortNumber: z.number().optional(),
			}),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const tunnelInstanceProxyPreviewId = yield* input
			.tunnelInstanceProxyPreview
			.safeUnwrap();
		return ApiConvex.v.TunnelInstanceProxyPreview.update({
			input: {
				id: tunnelInstanceProxyPreviewId,
				updates: input.updates,
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't update preview", error),
});
