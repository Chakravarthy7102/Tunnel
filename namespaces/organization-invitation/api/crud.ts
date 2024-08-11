import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import type { DocBase, Id } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	OrganizationInvitation_$dashboardPageData,
} from '@-/database/selections';
import { sendOrganizationInvitationEmail } from '@-/emails';
import { DocumentNotFoundError } from '@-/errors';
import type { OrganizationMemberRole } from '@-/organization-member';
import { $try, err, ok, ResultAsync } from 'errok';

export const ApiOrganizationInvitation_createAndSend = ({
	webappBaseUrl,
	organizationId,
	senderUserId,
	invitations,
}: {
	webappBaseUrl: string;
	organizationId: Id<'Organization'>;
	senderUserId: Id<'User'>;
	invitations: (
		{
			emailAddress: string;
			role: Exclude<OrganizationMemberRole, 'owner' | 'guest'>;
		} | {
			emailAddress: string;
			role: 'guest';
			authorizedProject: Id<'Project'>;
		} | {
			recipientUser: Id<'User'>;
			role: Exclude<OrganizationMemberRole, 'owner' | 'guest'>;
		} | {
			recipientUser: Id<'User'>;
			role: 'guest';
			authorizedProject: Id<'Project'>;
		}
	)[];
}) => ($try(async function*() {
	const senderUser = yield* ApiConvex.v.User.get({
		from: { id: senderUserId },
		include: {},
	}).safeUnwrap();

	if (senderUser === null) {
		return err(new DocumentNotFoundError('User'));
	}

	const organization = yield* ApiConvex.v.Organization.get({
		from: { id: organizationId },
		include: {},
	}).safeUnwrap();

	if (organization === null) {
		return err(new DocumentNotFoundError('Organization'));
	}

	const senderOrganizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: {
			organization: organizationId,
			user: senderUserId,
		},
		include: {},
	}).safeUnwrap();

	if (senderOrganizationMember === null) {
		return err(
			new Error(
				'The sender of the invitation is no longer a member of the organization.',
			),
		);
	}

	const organizationInvitations = yield* ResultAsync.combinePromises(
		invitations.map(async (invitation) =>
			$try(async function*() {
				let invitationRecipientEmailAddress: string;
				let user: DocBase<'User'> | null = null;
				const { role } = invitation;

				if ('emailAddress' in invitation) {
					user = yield* ApiConvex.v.User.get({
						from: {
							email: invitation.emailAddress,
						},
						include: {},
					}).safeUnwrap();
				} else {
					user = yield* ApiConvex.v.User.get({
						from: {
							id: invitation.recipientUser,
						},
						include: {},
					}).safeUnwrap();
				}

				if (user !== null) {
					invitationRecipientEmailAddress = user.email;
				} else if ('emailAddress' in invitation) {
					invitationRecipientEmailAddress = invitation.emailAddress;
				} else {
					return err(new DocumentNotFoundError('User'));
				}

				const organizationInvitation = yield* ApiConvex.v.OrganizationInvitation
					.create({
						input: {
							data: {
								organization: organizationId,
								recipientEmailAddress: invitationRecipientEmailAddress,
								recipientRole: role,
								recipientUser: user === null ? null : user._id,
								senderOrganizationMember: senderOrganizationMember._id,
								status: 'pending',
							},
							include: getInclude(OrganizationInvitation_$dashboardPageData),
						},
					}).safeUnwrap();

				await sendOrganizationInvitationEmail({
					webappBaseUrl,
					organizationInvitation,
				});

				if (invitation.role === 'guest') {
					yield* ApiConvex.v
						.OrganizationInvitationAuthorizedProjectRelation
						.create({
							input: {
								data: {
									organizationInvitation: organizationInvitation._id,
									project: invitation.authorizedProject,
								},
								include: {},
							},
						}).safeUnwrap();
				}

				if (user !== null) {
					const serverAnalytics = ApiAnalytics.getServerAnalytics();
					await serverAnalytics.invitation.sent({
						userId: user._id,
						organizationId,
					});
				}

				return ok(organizationInvitation);
			})
		),
	).safeUnwrap();

	return ok(organizationInvitations);
}));
