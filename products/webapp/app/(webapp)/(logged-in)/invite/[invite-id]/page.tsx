import { WebappApiActor } from '#api-actor';
import TunnelEmbed from '#components/v1/cards/tunnel-embed.tsx';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import { getInclude } from '@-/database/selection-utils';
import {
	OrganizationMember_$actorProfileData,
} from '@-/database/selections';
import { ApiOrganizationMember } from '@-/organization-member/api';
import { ApiOrganization } from '@-/organization/api';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export default async function OrganizationInvitePage({
	params: { 'invite-id': inviteId },
}: {
	params: { 'invite-id': string };
}) {
	const actorUser = await WebappApiActor.from(getUser(), {
		include: {
			organizationMemberships: {
				include: getInclude(OrganizationMember_$actorProfileData),
			},
		},
	});

	const organization = await ApiConvex.v.Organization.get({
		from: { inviteId },
		include: {},
	}).unwrapOrThrow();

	if (!organization) {
		return (
			<TunnelEmbed
				title="Invalid Invite"
				description="This invite doesn't seem to be valid. Please check the link and try again."
			/>
		);
	}

	const isMember = actorUser.organizationMemberships.some(
		({ organization: { _id } }) => _id === organization._id,
	);

	if (isMember) {
		return redirect(`/${organization.slug}`);
	}

	await ApiOrganizationMember.create({
		input: {
			data: {
				role: 'member',
				user: actorUser._id,
				organization: organization._id,
			},
			include: {},
		},
	}).unwrapOrThrow();

	const serverAnalytics = ApiAnalytics.getServerAnalytics();
	void serverAnalytics.invitation.accepted({
		userId: actorUser._id,
		organizationId: organization._id,
	});

	await ApiOrganization.updateSubscriptionAmount({
		organizationId: organization._id,
	}).unwrapOrThrow();

	return redirect(`/${organization.slug}`);
}
