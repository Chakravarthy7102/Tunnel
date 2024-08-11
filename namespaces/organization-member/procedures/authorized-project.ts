import { ApiOrganizationMember } from '#api';
import { OrganizationMemberRoleInput } from '#constants/role.ts';
import { ApiConvex } from '@-/convex/api';
import { WebappApiInput } from '@-/webapp/api-input';
import {} from '@-/database';
import { ProcedureError } from '@-/errors';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, ok } from 'errok';

export const organizationMember_addAuthorizedProject = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'notActor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.adminOrOwner,
				targetOrganizationMemberRole: OrganizationMemberRoleInput.guestOnly,
			})(input, ctx),
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.adminOrOwner,
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const projectId = yield* input.project.safeUnwrap();
		return ApiOrganizationMember.addAuthorizedProject({
			organizationMemberId,
			projectId,
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't add member to project", error),
});

export const organizationMember_removeAuthorizedProject = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'notActor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.adminOrOwner,
				targetOrganizationMemberRole: OrganizationMemberRoleInput.guestOnly,
			})(input, ctx),
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.adminOrOwner,
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const projectId = yield* input.project.safeUnwrap();
		const organizationMemberAuthorizedProjectRelation = yield* ApiConvex.v
			.OrganizationMemberAuthorizedProjectRelation.get({
				from: {
					organizationMember: organizationMemberId,
					project: projectId,
				},
				include: {},
			}).safeUnwrap();

		if (organizationMemberAuthorizedProjectRelation === null) {
			return ok();
		}

		return ApiOrganizationMember.removeAuthorizedProject({
			organizationMemberAuthorizedProjectRelationId:
				organizationMemberAuthorizedProjectRelation._id,
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't add member to project", error),
});
