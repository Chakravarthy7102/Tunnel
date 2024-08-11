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

		const { text, user_id } = await parseSlackPayload({ request });

		const actorOrganizationMember = await ApiConvex.v.OrganizationMember.get({
			from: { slackId: user_id },
			include: {
				user: true,
			},
		}).unwrapOrThrow();

		if (!actorOrganizationMember) {
			return sendSlackResponse(SlackAuthenticationStatus.NotLoggedIn);
		}

		const [org, proj] = text.split('/');

		if (!org && !proj) {
			return sendSlackResponse(SlackAuthenticationStatus.Empty);
		}

		const organization = await ApiConvex.v.Organization.get({
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know org is defined
			from: { name: org! },
			include: {
				projects: true,
			},
		}).unwrapOrThrow();

		if (!organization) {
			return new Response(
				`Organization \`${org}\` does not exist.`,
				{ status: 200 },
			);
		}

		if (org && !proj) {
			const subscriptions =
				(await ApiConvex.v.OrganizationMemberSlackSubscription.list({
					where: {
						organization: organization._id,
					},
					include: {},
				})).unwrapOrThrow();

			if (subscriptions.length > 0) {
				void subscriptions.map(async (subscription) => {
					await ApiConvex.v.OrganizationMemberSlackSubscription.delete({
						input: { id: subscription._id },
					}).unwrapOrThrow();
				});
			} else {
				return new Response(
					`You're not currently subscribed to \`${org}\`\nUse /tunnel subscribe \`${org}\` to subscribe.`,
					{ status: 200 },
				);
			}

			return new Response(`Unsubscribed from \`${org}\``, { status: 200 });
		} else if (org && proj) {
			const project = organization.projects.find(
				(project) => project.name === proj,
			);

			if (!project) {
				return new Response(
					`Project \`${proj}\` does not exist.`,
					{ status: 200 },
				);
			}

			const subscriptions =
				(await ApiConvex.v.OrganizationMemberSlackSubscription.list({
					where: {
						project: project._id,
					},
					include: {},
				})).unwrapOrThrow();

			if (subscriptions.length > 0) {
				void subscriptions.map(async (subscription) => {
					await ApiConvex.v.OrganizationMemberSlackSubscription.delete({
						input: { id: subscription._id },
					}).unwrapOrThrow();
				});
			} else {
				return new Response(
					`You're not currently subscribed to \`${org}/${proj}\`\nUse /tunnel subscribe \`${org}/${proj}\` to subscribe.`,
					{ status: 200 },
				);
			}

			return new Response(`Unsubscribed from \`${org}/${proj}\``, {
				status: 200,
			});
		}
	} catch (error: any) {
		logger.error(error.message);
		return new Response(error.message, { status: 500 });
	}
}
