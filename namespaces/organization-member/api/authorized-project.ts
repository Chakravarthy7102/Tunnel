import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const ApiOrganizationMember_addAuthorizedProject = ({
	organizationMemberId,
	projectId,
}: {
	organizationMemberId: Id<'OrganizationMember'>;
	projectId: Id<'Project'>;
}) => ($try(async function*() {
	const relation = yield* ApiConvex.v
		.OrganizationMemberAuthorizedProjectRelation
		.create({
			input: {
				data: {
					organizationMember: organizationMemberId,
					project: projectId,
				},
				include: {},
			},
		}).safeUnwrap();

	return ok(relation);
}));

export const ApiOrganizationMember_removeAuthorizedProject = ({
	organizationMemberAuthorizedProjectRelationId,
}: {
	organizationMemberAuthorizedProjectRelationId: Id<
		'OrganizationMemberAuthorizedProjectRelation'
	>;
}) => ($try(async function*() {
	const relation = yield* ApiConvex.v
		.OrganizationMemberAuthorizedProjectRelation
		.delete({
			input: { id: organizationMemberAuthorizedProjectRelationId },
		})
		.safeUnwrap();

	return ok(relation);
}));
