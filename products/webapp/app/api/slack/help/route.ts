import { DISCORD_URL, DOCS_URL } from '#utils/constants.ts';
import { parseSlackPayload } from '#utils/slack/parse-slack-payload.ts';
import { verifySlackSignature } from '#utils/slack/verify-slack-signature.ts';
import { ApiConvex } from '@-/convex/api';
import { env } from '@-/env';
import { logger } from '@-/logger';
import { ApiUrl } from '@-/url/api';
import Jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		await verifySlackSignature({ request });

		const { user_id, team_domain, channel_id } = await parseSlackPayload(
			{
				request,
			},
		);

		const state = Jwt.sign(
			{ userId: user_id, teamDomain: team_domain, channelId: channel_id },
			env('SLACK_SIGNING_SECRET'),
		);

		const actorOrganizationMember = await ApiConvex.v.OrganizationMember.get({
			from: { slackId: user_id },
			include: {
				user: true,
			},
		}).unwrapOrThrow();

		const continueWithTunnelUrl = ApiUrl.getWebappUrl({
			path: `/slack/link?state=${state}`,
			withScheme: true,
			fromHeaders: request.headers,
		});

		return NextResponse.json({
			blocks: [
				{
					type: 'header',
					text: {
						type: 'plain_text',
						text: 'Manage your account',
					},
				},
				{
					type: 'section',
					fields: [
						{
							type: 'mrkdwn',
							text:
								'Check your current auth status\nLog in with Tunnel\nLog out of Tunnel',
						},
						{
							type: 'mrkdwn',
							text: '`/tunnel whoami`\n`/tunnel login`\n`/tunnel logout`',
						},
					],
				},
				{
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: actorOrganizationMember ?
							`You are logged in to Tunnel as ${actorOrganizationMember.user.email}` :
							'Looks like you have not linked your Tunnel account yet',
					},
				},
				...(!actorOrganizationMember ?
					[{
						type: 'actions',
						elements: [
							{
								type: 'button',
								text: {
									type: 'plain_text',
									text: 'Continue with Tunnel',
								},
								style: 'primary',
								url: continueWithTunnelUrl,
							},
						],
					}] :
					[]),
				{
					type: 'divider',
				},
				{
					type: 'header',
					text: {
						type: 'plain_text',
						text: 'Subscribe',
					},
				},
				{
					type: 'section',
					fields: [
						{
							type: 'mrkdwn',
							text:
								'*Subscribe using the UI interface*\nSubscribe\nUnsubscribe\nShow subscriptions',
						},
						{
							type: 'mrkdwn',
							text:
								'`/tunnel subscribe`\n`/tunnel subscribe org/project`\n`/tunnel unsubscribe org/project`\n`/tunnel subscribe list`',
						},
					],
				},
				{
					type: 'divider',
				},
				{
					type: 'actions',
					elements: [
						{
							type: 'button',
							text: {
								type: 'plain_text',
								text: 'Documentation',
							},
							url: DOCS_URL,
						},
						{
							type: 'button',
							text: {
								type: 'plain_text',
								text: 'Contact Support',
							},
							url: DISCORD_URL,
						},
					],
				},
			],
		});
	} catch (error: any) {
		logger.error(error.message);
		return new Response(error.message, { status: 500 });
	}
}
