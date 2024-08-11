import { parseSlackPayload } from '#utils/slack/parse-slack-payload.ts';
import { verifySlackSignature } from '#utils/slack/verify-slack-signature.ts';
import { ApiConvex } from '@-/convex/api';
import { env } from '@-/env';
import { logger } from '@-/logger';
import { ApiUrl } from '@-/url/api';
import Jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import {
	Blocks,
	Elements,
	Message,
} from 'slack-block-builder';

export async function POST(request: Request) {
	try {
		await verifySlackSignature({ request });

		const { user_id, team_domain, channel_id, response_url } =
			await parseSlackPayload({
				request,
			});

		const actorOrganizationMember = await ApiConvex.v.OrganizationMember.get({
			from: { slackId: user_id },
			include: {
				user: true,
			},
		}).unwrapOrThrow();

		if (actorOrganizationMember) {
			return new Response(
				`You are already logged in to Tunnel with <mailto:${actorOrganizationMember.user.email}|${actorOrganizationMember.user.email}>.\nTo logout, run \`/tunnel logout\``,
			);
		}

		const state = Jwt.sign(
			{
				userId: user_id,
				teamDomain: team_domain,
				channelId: channel_id,
				responseUrl: response_url,
			},
			env('SLACK_SIGNING_SECRET'),
		);

		const url = ApiUrl.getWebappUrl({
			path: `/slack/link?state=${state}`,
			withScheme: true,
			fromHeaders: request.headers,
		});

		return NextResponse.json(
			Message()
				.blocks(
					Blocks.Actions().elements(
						Elements.Button({
							text: 'Continue with Tunnel',
							url,
						}).primary(),
					),
				).buildToObject(),
		);
	} catch (error: any) {
		logger.error(error.message);
		return new Response(error.message, { status: 500 });
	}
}
