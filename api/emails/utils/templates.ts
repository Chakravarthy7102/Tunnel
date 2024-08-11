import type { ServerDoc } from '@-/database';
import type { OrganizationInvitation_$dashboardPageData } from '@-/database/selections';
import { getLoops } from './loops.ts';

export const sendOrganizationInvitationEmail = async ({
	organizationInvitation,
	webappBaseUrl,
}: {
	organizationInvitation: ServerDoc<
		typeof OrganizationInvitation_$dashboardPageData
	>;
	webappBaseUrl: string;
}) => {
	const loops = getLoops();

	const emailTo = organizationInvitation.recipientEmailAddress ??
		organizationInvitation.recipientUser?.email ??
		null;

	if (emailTo === null) {
		throw new Error(
			'No email address found for organization invitation recipient',
		);
	}

	const manageInvitationUrl =
		`${webappBaseUrl}/join/${organizationInvitation._id}`;

	await loops.sendTransactionalEmail(
		'clsarkgie00vajgagnndfxaw5',
		emailTo,
		{
			inviterName:
				organizationInvitation.senderOrganizationMember.user.fullName,
			organizationName: organizationInvitation.organization.name,
			manageInvitationUrl,
		},
	);
};
