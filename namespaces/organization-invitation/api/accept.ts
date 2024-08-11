import { ApiAnalytics } from '@-/analytics/api';
import { getWorkos } from '@-/auth/workos';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { ApiOrganizationMember } from '@-/organization-member/api';
import { ApiOrganization } from '@-/organization/api';
import { $try, err, ok } from 'errok';

/**
	This function should only be called after the invite is accepted (which should be triggered by a WorkOS webhook)
*/
export const ApiOrganizationInvitation_accept = (
	{
		organizationInvitationId,
		recipientUserId,
	}: {
		organizationInvitationId: Id<'OrganizationInvitation'>;
		recipientUserId: Id<'User'>;
	},
) => ($try(async function*() {
	const organizationInvitation = yield* ApiConvex.v.OrganizationInvitation.get({
		from: { id: organizationInvitationId },
		include: {
			organization: true,
		},
	}).safeUnwrap();

	if (organizationInvitation === null) {
		return err(new Error('Organization invitation not found'));
	}

	const { page: organizationInvitationAuthorizedProjectRelations } =
		yield* ApiConvex.v
			.OrganizationInvitationAuthorizedProjectRelation.list({
				where: {
					organizationInvitation: organizationInvitation._id,
				},
				include: {
					project: true,
				},
				paginationOpts: {
					cursor: null,
					numItems: 100,
				},
			}).safeUnwrap();

	const recipientOrganizationMember = yield* ApiOrganizationMember.create(
		{
			input: {
				data: {
					role: organizationInvitation.recipientRole,
					user: recipientUserId,
					organization: organizationInvitation.organization._id,
				},
				include: { user: true },
			},
		},
	).safeUnwrap();

	if (organizationInvitation.recipientRole === 'guest') {
		for (
			const authorizedProjectRelation
				of organizationInvitationAuthorizedProjectRelations
		) {
			yield* ApiConvex.v.OrganizationMemberAuthorizedProjectRelation.create({
				input: {
					data: {
						organizationMember: recipientOrganizationMember._id,
						project: authorizedProjectRelation.project._id,
					},
					include: {},
				},
			}).safeUnwrap();
		}

		const serverAnalytics = ApiAnalytics.getServerAnalytics();
		await serverAnalytics.invitation.accepted({
			userId: recipientUserId,
			organizationId: organizationInvitation.organization._id,
		});
	}

	// Add the user to the WorkOS organization
	const workos = getWorkos();
	const workosOrganization = yield* ApiConvex.v.Organization
		.ensureWorkosOrganization({
			organization: organizationInvitation.organization._id,
		}).safeUnwrap();
	const recipientWorkosUser = yield* ApiConvex.v.User.ensureWorkosUser({
		user: recipientUserId,
	}).safeUnwrap();
	await workos.userManagement.createOrganizationMembership({
		organizationId: workosOrganization.id,
		userId: recipientWorkosUser.id,
		roleSlug: organizationInvitation.recipientRole,
	});

	yield* ApiOrganization.updateSubscriptionAmount({
		organizationId: organizationInvitation.organization._id,
	}).safeUnwrap();

	return ok();
}));
