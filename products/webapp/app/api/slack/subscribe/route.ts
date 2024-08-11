import { parseSlackPayload } from '#utils/slack/parse-slack-payload.ts';
import {
	sendSlackResponse,
	SlackAuthenticationStatus,
} from '#utils/slack/send-slack-response.ts';
import { verifySlackSignature } from '#utils/slack/verify-slack-signature.ts';
import { ApiConvex } from '@-/convex/api';
import { logger } from '@-/logger';
import { ApiUrl } from '@-/url/api';
import { WebClient } from '@slack/web-api';
import {
	Bits,
	Blocks,
	Elements,
	Modal,
} from 'slack-block-builder';

export async function POST(request: Request) {
	try {
		await verifySlackSignature({ request });

		const { trigger_id, user_id, channel_id, text, channel_name } =
			await parseSlackPayload({
				request,
			});

		const actorOrganizationMember = await ApiConvex.v.OrganizationMember.get({
			from: { slackId: user_id },
			include: {
				organization: {
					include: {
						slackOrganization: true,
					},
				},
				user: {
					include: {
						organizationMemberships: {
							include: {
								organization: {
									include: {
										projects: true,
									},
								},
							},
						},
					},
				},
			},
		}).unwrapOrThrow();

		if (!actorOrganizationMember) {
			return sendSlackResponse(SlackAuthenticationStatus.NotLoggedIn);
		}

		const [org, proj] = text.split('/');

		const webappUrl = ApiUrl.getWebappUrl({
			withScheme: true,
			fromHeaders: request.headers,
		});

		if (text === 'list') {
			const subscriptions = await ApiConvex.v
				.OrganizationMemberSlackSubscription
				.list(
					{
						where: {
							channelId: channel_id,
						},
						include: {
							organization: true,
							project: true,
						},
					},
				).unwrapOrThrow();

			const formattedSubscriptions = subscriptions.map((subscription) => {
				const { slug, name: orgName } = subscription.organization;

				if (!subscription.project) {
					return `<${webappUrl}/${slug}|${orgName}>`;
				} else {
					const { name: projectName } = subscription.project;
					return `<${webappUrl}/${slug}/${projectName}|${orgName}/${projectName}>`;
				}
			});

			if (formattedSubscriptions.length > 1) {
				const lastSubscription = formattedSubscriptions.pop();
				const subscriptionsList = formattedSubscriptions.join(', ') +
					` & ${lastSubscription}`;

				return new Response(
					`This channel is subscribed to the following accounts and projects:\n${subscriptionsList}`,
					{ status: 200 },
				);
			} else if (formattedSubscriptions.length === 1) {
				return new Response(
					`This channel is subscribed to the following account or project:\n${
						formattedSubscriptions[0]
					}`,
					{ status: 200 },
				);
			} else {
				return new Response(
					'This channel is not subscribed to any accounts or projects.',
					{ status: 200 },
				);
			}
		} else if (org ?? proj) {
			if (!org) {
				return sendSlackResponse(SlackAuthenticationStatus.Empty);
			}

			const organization = await ApiConvex.v.Organization.get({
				from: { name: org },
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

			const existingSubscriptions = await ApiConvex.v
				.OrganizationMemberSlackSubscription.list({
					where: {
						organizationMember: actorOrganizationMember._id,
					},
					include: {
						organization: true,
						project: true,
					},
				}).unwrapOrThrow();

			const hasExistingSubscription = existingSubscriptions.find(
				(subscription) => {
					if (subscription.project) {
						return subscription.project.name === proj;
					} else {
						return subscription.organization.name === org;
					}
				},
			);

			if (org && !proj) {
				if (hasExistingSubscription) {
					return new Response(
						`This channel is already subscribed to \`${org}\``,
						{ status: 200 },
					);
				}

				(await ApiConvex.v.OrganizationMemberSlackSubscription.create({
					input: {
						data: {
							organization: organization._id,
							project: null,
							organizationMember: actorOrganizationMember._id,
							channelId: channel_id,
							channelName: channel_name,
						},
					},
				})).unwrapOrThrow();

				return new Response(`Subscribed to \`${org}\``);
			} else if (org && proj) {
				if (hasExistingSubscription) {
					return new Response(
						`This channel is already subscribed to \`${org}/${proj}\``,
						{ status: 200 },
					);
				}

				const project = organization.projects.find(
					(project) => project.name === proj,
				);

				if (!project) {
					return new Response(
						`Project \`${proj}\` does not exist.`,
						{ status: 200 },
					);
				}

				(await ApiConvex.v.OrganizationMemberSlackSubscription.create({
					input: {
						data: {
							organization: organization._id,
							project: project._id,
							organizationMember: actorOrganizationMember._id,
							channelId: channel_id,
							channelName: channel_name,
						},
					},
				})).unwrapOrThrow();

				return new Response(`Subscribed to \`${org}/${proj}\``, {
					status: 200,
				});
			}

			return sendSlackResponse(SlackAuthenticationStatus.Empty);
		} else {
			const organizations = actorOrganizationMember.user.organizationMemberships
				.map((membership) => membership.organization).filter((organization) =>
					organization.projectsCount > 0
				);

			const accessToken = actorOrganizationMember.organization
				.slackOrganization
				?.accessToken;

			if (!accessToken) {
				return new Response(
					'Organization does not have a Slack integration',
					{ status: 200 },
				);
			}

			const slackClient = new WebClient(accessToken);

			await slackClient.views.open({
				trigger_id,
				view: Modal({
					title: 'Subscribe to a project',
					submit: 'Subscribe',
					close: 'Cancel',
					privateMetaData: JSON.stringify({
						userId: user_id,
						channelId: channel_id,
						channelName: channel_name,
					}),
				}).blocks(
					Blocks.Input({
						label: 'Select an organization',
					}).element(
						Elements.StaticSelect()
							.actionId('select_organization')
							.options(
								organizations.map((organization) =>
									Bits.Option({
										text: organization.name,
										value: organization._id,
									})
								),
							),
					).dispatchAction(),
				).buildToObject(),
			});

			return sendSlackResponse(SlackAuthenticationStatus.Empty);
		}
	} catch (error: any) {
		logger.error(error.message);
		return new Response(error.message, { status: 500 });
	}
}
