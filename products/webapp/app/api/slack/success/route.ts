import {
	sendSlackResponse,
	SlackAuthenticationStatus,
} from '#utils/slack/send-slack-response.ts';
import { verifySlackSignature } from '#utils/slack/verify-slack-signature.ts';
import { ApiConvex } from '@-/convex/api';
import { logger } from '@-/logger';
import { WebClient } from '@slack/web-api';

export async function POST(request: Request) {
	try {
		await verifySlackSignature({ request });

		const { userId, responseUrl, organizationMemberId } = await request.json();

		const actorOrganizationMember = await ApiConvex.v.OrganizationMember.get({
			from: { id: organizationMemberId },
			include: {
				user: true,
				organization: {
					include: {
						slackOrganization: true,
					},
				},
			},
		}).unwrapOrThrow();

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- tood
		if (!actorOrganizationMember) {
			return sendSlackResponse(SlackAuthenticationStatus.NotLoggedIn);
		}

		const accessToken = actorOrganizationMember.organization.slackOrganization
			?.accessToken;

		if (!accessToken) {
			return sendSlackResponse(SlackAuthenticationStatus.NotLoggedIn);
		}

		const slackClient = new WebClient(accessToken);

		await fetch(responseUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				replace_original: true,
				text: ':white_check_mark: Successfully authenticated',
			}),
		});

		await slackClient.chat.postMessage({
			channel: userId,
			text:
				`Hey <@${userId}>, you're all set up!\n\nLearn more about how you can interact with me by using \`/tunnel help\``,
		});

		return sendSlackResponse(SlackAuthenticationStatus.Empty);
	} catch (error: any) {
		logger.error(error.message);
		return new Response(error.message, { status: 500 });
	}
}
