import { ApiConvex } from '@-/convex/api';
import type { Selection } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try } from 'errok';
import type { EmptyObject } from 'type-fest';

const buildListProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.union([
			z.object({
				projectCommentThread: WebappApiInput.projectCommentThread({
					actor,
					actorRelation: 'hasProjectLivePreviewPermission',
				})(input, ctx),
			}),
			z.object({
				organization: WebappApiInput.organization({
					actor,
					actorOrganizationMemberRole:
						OrganizationMemberRoleInput.guestOrHigher,
					plans: 'any',
				})(input, ctx),
				text: z.string(),
			}),
			z.object({
				project: WebappApiInput.project({
					actor,
					actorOrganizationMemberRole:
						OrganizationMemberRoleInput.guestOrHigher,
				})(input, ctx),
				text: z.string(),
			}),
		])),
	query: async ({ input }) => ($try(async function*() {
		if ('projectCommentThread' in input) {
			const projectCommentThreadId = yield* input.projectCommentThread
				.safeUnwrap();
			return ApiConvex.v.ProjectComment.list({
				include: getInclude(selection),
				where: {
					projectCommentThread: projectCommentThreadId,
				},
			});
		} else if ('organization' in input) {
			const organizationId = yield* input.organization.safeUnwrap();
			return ApiConvex.v.ProjectComment.list({
				include: getInclude(selection),
				where: {
					organization: organizationId,
					text: input.text,
				},
			});
		} else {
			const projectId = yield* input.project.safeUnwrap();
			return ApiConvex.v.ProjectComment.list({
				include: getInclude(selection),
				where: {
					project: projectId,
					text: input.text,
				},
			});
		}
	})),
	error: ({ error }) => new ProcedureError("Couldn't list comments", error),
}));

export const projectComment_list = buildListProcedure({});
