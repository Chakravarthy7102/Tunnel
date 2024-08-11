import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import type { Selection } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	getIncludes,
	ProjectLivePreview_$projectData,
	ProjectLivePreview_$recursiveTunneledServiceEnvironmentData,
	ProjectLivePreview_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { ApiProjectLivePreview } from '@-/project-live-preview/api';
import { z } from '@-/zod';
import { unreachableCase } from '@tunnel/ts';
import { $try, ok } from 'errok';
import type { EmptyObject } from 'type-fest';

const buildGetProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.union([
			z.object({
				projectLivePreview: WebappApiInput.projectLivePreview({
					identifier: 'id',
					actor,
					actorRelation: 'hasPermission',
				})(input, ctx),
			}),
			z.object({
				projectLivePreview: WebappApiInput.projectLivePreview({
					identifier: 'url',
					actor,
					actorRelation: 'hasPermission',
				})(input, ctx),
			}),
		])),
	query: async ({ input }) => ($try(async function*() {
		if (
			input.projectLivePreview.isErr() &&
			input.projectLivePreview.error instanceof DocumentNotFoundError
		) {
			return ok(null);
		}

		const projectLivePreviewId = yield* input.projectLivePreview
			.safeUnwrap();
		return ApiConvex.v.ProjectLivePreview.get({
			from: { id: projectLivePreviewId },
			include: getInclude(selection),
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't get project live preview", error),
}));

export const projectLivePreview_get = buildGetProcedure({});
export const projectLivePreview_get$recursiveTunneledServiceEnvironmentData =
	buildGetProcedure(
		ProjectLivePreview_$recursiveTunneledServiceEnvironmentData,
	);

export const projectLivePreview_getPublicData = defineProcedure({
	input: WebappApiInput.withCtx(({ input, ctx }) =>
		z.object({
			projectLivePreview: WebappApiInput.projectLivePreview({
				identifier: 'url',
				actor: null,
				actorRelation: 'anyone',
			})(input, ctx),
		})
	),
	query: async ({ input }) => ($try(async function*() {
		const includes = getIncludes();

		if (
			input.projectLivePreview.isErr() &&
			input.projectLivePreview.error instanceof DocumentNotFoundError
		) {
			return ok(null);
		}

		const projectLivePreviewId = yield* input.projectLivePreview.safeUnwrap();

		return ApiConvex.v.ProjectLivePreview.get({
			from: { id: projectLivePreviewId },
			include: includes.ProjectLivePreview({
				linkedTunnelInstanceProxyPreview: true,
				project: true,
			}),
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't get project live preview", error),
});

const buildListProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.union([
			z.object({
				project: WebappApiInput.project({
					actor,
					actorOrganizationMemberRole:
						OrganizationMemberRoleInput.memberOrHigher,
				})(input, ctx),
			}),
			z.object({
				tunnelInstanceProxyPreview: WebappApiInput.tunnelInstanceProxyPreview(
					{
						identifier: 'id',
						actor,
						actorRelation: 'creator',
					},
				)(input, ctx),
			}),
			// TODO: we shouldn't ever be listing _all_ the organization's project live previews at once but currently do so for selecting the project live preview to link with when using the <script> tag locally
			z.object({
				organizationMember: WebappApiInput.organizationMember({
					actor,
					actorRelation: 'actor',
					actorOrganizationMemberRole:
						OrganizationMemberRoleInput.guestOrHigher,
				})(input, ctx),
			}),
		])),
	query: async ({ input }) => ($try(async function*() {
		switch (true) {
			case 'project' in input: {
				const projectId = yield* input.project.safeUnwrap();
				return ApiConvex.v.ProjectLivePreview.list({
					include: getInclude(selection),
					where: {
						inProject: projectId,
					},
				});
			}

			case 'tunnelInstanceProxyPreview' in input: {
				const tunnelInstanceProxyPreviewId = yield* input
					.tunnelInstanceProxyPreview.safeUnwrap();
				return ApiConvex.v.ProjectLivePreview.list({
					include: getInclude(selection),
					where: {
						linkedTunnelInstanceProxyPreview: tunnelInstanceProxyPreviewId,
					},
				});
			}

			case 'organizationMember' in input: {
				const organizationMemberId = yield* input.organizationMember
					.safeUnwrap();
				return ApiConvex.v.ProjectLivePreview.list({
					include: getInclude(selection),
					where: {
						organizationMember: organizationMemberId,
					},
				});
			}

			default: {
				return unreachableCase(
					input,
					`Invalid input: ${JSON.stringify(input)}`,
				);
			}
		}
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't list project live previews", error),
}));

export const projectLivePreview_list = buildListProcedure({});
export const projectLivePreview_list$projectData = buildListProcedure(
	ProjectLivePreview_$projectData,
);

const buildCreateProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
			})(input, ctx),
			slug: z.string().regex(/^[\da-z-]+$/),
			linkedTunnelInstanceProxyPreview: z.nullable(
				WebappApiInput.tunnelInstanceProxyPreview({
					identifier: 'id',
					actor,
					actorRelation: 'creator',
				})(input, ctx),
			),
			createdByUser: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const createdByUserId = yield* input.createdByUser.safeUnwrap();
		const projectId = yield* input.project.safeUnwrap();
		const linkedTunnelInstanceProxyPreviewId =
			input.linkedTunnelInstanceProxyPreview === null ? null : yield* input
				.linkedTunnelInstanceProxyPreview.safeUnwrap();
		const { slug } = input;
		return ApiProjectLivePreview.create({
			input: {
				projectLivePreview: {
					url: `${slug}.tunnelapp.dev`,
					project: projectId,
					linkedTunnelInstanceProxyPreview:
						linkedTunnelInstanceProxyPreviewId ?? null,
					isLive: true,
					createdByUser: createdByUserId,
				},
				include: getInclude(selection),
			},
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't create project live preview", error),
}));

export const projectLivePreview_create = buildCreateProcedure({});
export const projectLivePreview_create$tunnelInstancePageToolbarData =
	buildCreateProcedure(
		ProjectLivePreview_$tunnelInstancePageToolbarData,
	);

export const projectLivePreview_update = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			projectLivePreview: WebappApiInput.projectLivePreview({
				identifier: 'id',
				actor,
				actorRelation: 'host',
			})(input, ctx),
			updates: z.object({
				url: z.string().optional(),
				liveshareLink: z.string().nullable().optional(),
				viewPermission: z
					.enum(['anyoneWithLink', 'project', 'private'])
					.optional(),
			}),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const projectLivePreviewId = yield* input.projectLivePreview.safeUnwrap();
		return ApiConvex.v.ProjectLivePreview.update({
			input: {
				id: projectLivePreviewId,
				updates: input.updates,
			},
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't update project live preview", error),
});
