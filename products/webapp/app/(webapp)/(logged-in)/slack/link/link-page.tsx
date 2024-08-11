'use client';

import type { SlackLoginJWT } from '#types';
import type { ServerDoc } from '@-/database';
import type {
	OrganizationMember_$actorProfileData,
	User_$profileData,
} from '@-/database/selections';
import { Button } from '@-/design-system/v1';
import { jwtDecode } from 'jwt-decode';

export default function SlackLinkPageComponent({
	actorOrganizationMember,
	state,
}: {
	actorOrganizationMember: ServerDoc<
		typeof OrganizationMember_$actorProfileData
	>;
	actorUser: ServerDoc<typeof User_$profileData>;
	state: string | null;
}) {
	if (!state) {
		return null;
	}

	// const updateOrganizationMemberIntegration = trpc.organizationMemberIntegration
	// 	.update.useMutation();

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- for now
	const { userId, teamDomain, channelId, responseUrl } = jwtDecode(
		state,
	) as SlackLoginJWT;

	const connectUser = async () => {
		await fetch(`/api/slack/success`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId,
				responseUrl,
				organizationMemberId: actorOrganizationMember._id,
			}),
		});

		window.location.assign(
			`https://${teamDomain}.slack.com/app_redirect?channel=${channelId}`,
		);

		// TODO: add Slack user to OrganizationMemberSlackAccount
	};

	return (
		<Button className="mt-5" onClick={connectUser}>
			Continue with Tunnel
		</Button>
	);
}
