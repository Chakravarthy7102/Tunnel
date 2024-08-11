import { parseSlackPayload } from '#utils/slack/parse-slack-payload.ts';
import {
	sendSlackResponse,
	SlackAuthenticationStatus,
} from '#utils/slack/send-slack-response.ts';
import { verifySlackSignature } from '#utils/slack/verify-slack-signature.ts';
import { ApiConvex } from '@-/convex/api';
import { logger } from '@-/logger';

export async function POST(request: Request) {
	try {
		await verifySlackSignature({ request });

		const { user_id } = await parseSlackPayload({ request });

		const actorOrganizationMember = await ApiConvex.v.OrganizationMember.get({
			from: { slackId: user_id },
			include: {
				user: true,
			},
		}).unwrapOrThrow();

		if (!actorOrganizationMember) {
			return sendSlackResponse(SlackAuthenticationStatus.NotLoggedIn);
		}

		await ApiConvex.v.OrganizationMemberIntegration.delete({
			input: {
				type: 'OrganizationMemberSlackAccount',
				where: {
					organizationMember: actorOrganizationMember._id,
				},
			},
		}).unwrapOrThrow();

		return new Response(
			`Your account was successfully unlinked.`,
			{ status: 200 },
		);
	} catch (error: any) {
		logger.error(error.message);
		return new Response(error.message, { status: 500 });
	}
}
