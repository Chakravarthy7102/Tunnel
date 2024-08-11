import { ApiConvex } from '@-/convex/api';
import { getVapi } from '@-/database/vapi';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { projectCommentThreadFiltersSelectionSchema } from '@-/project-comment-thread/schemas';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { unreachableCase } from '@tunnel/ts';
import { $try, ok } from 'errok';

export const projectCommentThread_listPreloaded$tunnelInstancePageToolbarData =
	defineProcedure({
		input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
			z.union([
				z.object({
					linkedProjectLivePreview: WebappApiInput.projectLivePreview({
						identifier: 'id',
						actor,
						actorRelation: 'hasPermission',
					})(input, ctx),
					filtersSelection: projectCommentThreadFiltersSelectionSchema
						.nullable(),
				}),
				z.object({
					project: WebappApiInput.project({
						actor,
						actorOrganizationMemberRole:
							OrganizationMemberRoleInput.guestOrHigher,
					})(input, ctx),
					filtersSelection: projectCommentThreadFiltersSelectionSchema
						.nullable(),
				}),
			])),
		query: async ({ input, ctx }) => ($try(async function*() {
			const vapi = await getVapi();

			switch (true) {
				case 'linkedProjectLivePreview' in input: {
					const linkedProjectLivePreviewId = yield* input
						.linkedProjectLivePreview
						.safeUnwrap();
					return ok(
						await ApiConvex.preloadProtectedQuery(
							vapi.v.ProjectCommentThread_list_tunnelInstancePageToolbarData,
							{
								where: {
									linkedProjectLivePreview: linkedProjectLivePreviewId,
									filtersSelection: input.filtersSelection,
								},
								paginationOpts: {
									cursor: null,
									numItems: 10,
								},
							},
							{ token: ctx.accessToken },
						),
					);
				}

				case 'project' in input: {
					const projectId = yield* input.project.safeUnwrap();
					return ok(
						await ApiConvex.preloadProtectedQuery(
							vapi.v.ProjectCommentThread_list_tunnelInstancePageToolbarData,
							{
								where: {
									project: projectId,
									filtersSelection: input.filtersSelection,
								},
								paginationOpts: {
									cursor: null,
									numItems: 10,
								},
							},
							{ token: ctx.accessToken },
						),
					);
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
			new ProcedureError("Couldn't get comment threads", error),
	});
