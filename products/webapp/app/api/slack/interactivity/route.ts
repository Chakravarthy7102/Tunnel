/* eslint-disable complexity -- for now */
/* eslint-disable max-depth -- for now */

import type { SlackInteractionPayload } from '#types';
import { parseSlackPayload } from '#utils/slack/parse-slack-payload.ts';
import {
	sendSlackResponse,
	SlackAuthenticationStatus,
} from '#utils/slack/send-slack-response.ts';
import { verifySlackSignature } from '#utils/slack/verify-slack-signature.ts';
import { ApiConvex } from '@-/convex/api';
import { type Id } from '@-/database';
import { logger } from '@-/logger';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';
import { ApiSlack } from '@-/slack-integration/api';
import destr from 'destru';
import { NextResponse } from 'next/server';
import {
	Bits,
	Blocks,
	Elements,
	Modal,
} from 'slack-block-builder';

export async function POST(request: Request) {
	try {
		await verifySlackSignature({ request });

		const { payload } = await parseSlackPayload({ request });

		const parsedPayload = destr(
			payload,
		) as SlackInteractionPayload['payload'];

		const actorOrganizationMember = await ApiConvex.v.OrganizationMember.get({
			from: {
				slackId: parsedPayload.user.id,
			},
			include: {
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
				organization: {
					include: {
						slackOrganization: true,
					},
				},
			},
		}).unwrapOrThrow();

		const accessToken = actorOrganizationMember?.organization.slackOrganization
			?.accessToken;

		if (!accessToken) {
			return sendSlackResponse(SlackAuthenticationStatus.NotLoggedIn);
		}

		const slackClient = await ApiSlack.getClient({
			organizationMemberId: actorOrganizationMember._id,
		}).unwrapOrThrow();

		const organizations = actorOrganizationMember.user.organizationMemberships
			.map((
				membership,
			) => membership.organization).filter((organization) =>
				organization.projectsCount > 0
			);

		switch (parsedPayload.type) {
			case 'block_actions': {
				if (parsedPayload.actions && parsedPayload.actions.length > 0) {
					void parsedPayload.actions.map(async (action) => {
						switch (action.action_id) {
							case 'select_organization': {
								const { container, view } = parsedPayload;
								const state = view.state.values;

								const organization = organizations.find((organization) =>
									organization._id === action.selected_option.value
								);

								if (!organization) {
									return new Response('Unable to find organization', {
										status: 200,
									});
								}

								const projects = organization.projects.map((project) =>
									project
								);
								let selectedOrganization: {
									text: {
										type: string;
										text: string;
										emoji?: boolean;
									};
									value?: string;
								} = {
									text: { type: '', text: '', emoji: false },
									value: '',
								};

								for (const key in state) {
									if (Object.hasOwn(state, key)) {
										if (state[key]?.select_organization) {
											const selectedOption = state[key]?.select_organization
												?.selected_option;

											if (selectedOption) {
												selectedOrganization = selectedOption;
											}
										}
									}
								}

								const { channelId } = destr(view.private_metadata) as any;

								await slackClient.views.update({
									view_id: container.view_id,
									hash: view.hash,
									view: Modal({
										title: 'Subscribe to a project',
										submit: 'Subscribe',
										close: 'Cancel',
										privateMetaData: JSON.stringify({
											userId: parsedPayload.user.id,
											channelId,
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
												).initialOption(
													Bits.Option({
														text: selectedOrganization.text.text,
														value: selectedOrganization.value,
													}),
												),
										).dispatchAction(),
										Blocks.Input({
											label: 'Select a project',
										}).element(
											Elements.StaticSelect()
												.actionId('select_project')
												.options(
													projects.map((project) =>
														Bits.Option({
															text: project.name,
															value: project._id,
														})
													),
												),
										).optional(),
									).buildToObject(),
								});

								break;
							}

							case 'resolve_comment_button': {
								const commentThread = await ApiConvex.v.ProjectCommentThread
									.get({
										from: { projectSlackMessageId: parsedPayload.message.ts },
										include: {
											resolvedByUser: true,
											slackMessageRelation: {
												include: {
													projectSlackMessage: true,
												},
											},
											comments: {
												include: {
													contentTextContent: true,
													authorUser: true,
												},
											},
										},
									}).unwrapOrThrow();

								const firstComment = commentThread?.comments[0];

								if (!commentThread || !firstComment) {
									return new Response('Unable to find comment thread', {
										status: 200,
									});
								}

								const commentThreadId = commentThread._id;
								const authorUserId = firstComment.authorUser?._id;

								if (!authorUserId) {
									return new Response('Comment thread already resolved', {
										status: 200,
									});
								}

								await ApiProjectCommentThread.resolve({
									commentThreadId,
									resolvedByUserId: authorUserId,
									shouldRunSideEffects: true,
								}).unwrapOrThrow();

								if (
									!commentThread.slackMessageRelation?.projectSlackMessage
										.messageId
								) {
									return new Response('Unable to find slack message', {
										status: 200,
									});
								}

								const existingSlackMessage = await slackClient.conversations
									.history({
										channel: parsedPayload.channel.id,
										limit: 1,
										latest: commentThread.slackMessageRelation
											.projectSlackMessage.messageId,
										inclusive: true,
									});

								if (!existingSlackMessage.messages?.[0]) {
									return new Response('Unable to find message', {
										status: 200,
									});
								}

								const firstMessage = existingSlackMessage.messages[0];
								const firstAttachment = firstMessage.attachments?.[0];
								const actionsBlockIndex = firstAttachment?.blocks?.findIndex(
									// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- todo
									(block) => block.type === 'actions',
								);

								if (!actionsBlockIndex) {
									return new Response('Unable to find actions block', {
										status: 200,
									});
								}

								await slackClient.chat.update({
									channel: parsedPayload.channel.id,
									ts: commentThread.slackMessageRelation
										.projectSlackMessage.messageId,
									text: firstMessage.text,
									attachments: [{
										color: '#50C878',
										// @ts-expect-error -- todo: fix these types
										blocks: [
											...(actionsBlockIndex !== -1 ?
												firstAttachment?.blocks?.slice(0, actionsBlockIndex) ??
													[] :
												[]),
											{
												type: 'actions',
												elements: [
													{
														type: 'button',
														text: {
															type: 'plain_text',
															text: 'Unresolve',
														},
														action_id: 'unresolve_comment_button',
													},
												],
											},
											...(actionsBlockIndex !== -1 ?
												firstAttachment?.blocks?.slice(actionsBlockIndex + 1) ??
													[] :
												[]),
										],
									}],
								});

								break;
							}

							case 'unresolve_comment_button': {
								const commentThread = await ApiConvex.v.ProjectCommentThread
									.get({
										from: { projectSlackMessageId: parsedPayload.message.ts },
										include: {
											resolvedByUser: true,
											slackMessageRelation: {
												include: {
													projectSlackMessage: true,
												},
											},
											comments: {
												include: {
													contentTextContent: true,
													authorUser: true,
												},
											},
										},
									}).unwrapOrThrow();

								if (!commentThread) {
									return new Response('Unable to find comment thread', {
										status: 200,
									});
								}

								const commentThreadId = commentThread._id;

								if (commentThread.resolvedByUser !== null) {
									await ApiProjectCommentThread.unresolve({
										projectCommentThreadId: commentThreadId,
									}).unwrapOrThrow();
								}

								if (
									!commentThread.slackMessageRelation?.projectSlackMessage
										.messageId
								) {
									return new Response('Unable to find slack message', {
										status: 200,
									});
								}

								const existingSlackMessage = await slackClient.conversations
									.history({
										channel: parsedPayload.channel.id,
										limit: 1,
										latest: commentThread.slackMessageRelation
											.projectSlackMessage.messageId,
										inclusive: true,
									});

								if (!existingSlackMessage.messages?.[0]) {
									return new Response('Unable to find message', {
										status: 200,
									});
								}

								const firstMessage = existingSlackMessage.messages[0];
								const firstAttachment = firstMessage.attachments?.[0];
								const actionsBlockIndex = firstAttachment?.blocks?.findIndex(
									// eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- todo
									(block) => block.type === 'actions',
								);

								if (!actionsBlockIndex) {
									return new Response('Unable to find actions block', {
										status: 200,
									});
								}

								await slackClient.chat.update({
									channel: parsedPayload.channel.id,
									ts: commentThread.slackMessageRelation
										.projectSlackMessage.messageId,
									text: firstMessage.text,
									attachments: [{
										color: '#3662E3',
										// @ts-expect-error: fix types
										blocks: [
											...(actionsBlockIndex !== -1 ?
												firstAttachment?.blocks?.slice(0, actionsBlockIndex) ??
													[] :
												[]),
											{
												type: 'actions',
												elements: [
													{
														type: 'button',
														text: {
															type: 'plain_text',
															text: 'Resolve',
														},
														action_id: 'resolve_comment_button',
													},
												],
											},
											...(actionsBlockIndex !== -1 ?
												firstAttachment?.blocks?.slice(actionsBlockIndex + 1) ??
													[] :
												[]),
										],
									}],
								});
								break;
							}

							default:
						}
					});
				}

				break;
			}

			case 'view_submission': {
				const state = parsedPayload.view.state.values;

				const result: {
					selectedOrganization: string | null;
					selectedProject: string | null;
				} = {
					selectedOrganization: null,
					selectedProject: null,
				};

				for (const key in state) {
					if (Object.hasOwn(state, key)) {
						if (state[key]?.select_organization) {
							const selectedOption = state[key]?.select_organization
								?.selected_option;

							result.selectedOrganization = selectedOption?.value ?? null;
						}

						if (state[key]?.select_project) {
							const selectedOption = state[key]?.select_project
								?.selected_option;

							result.selectedProject = selectedOption?.value ?? null;
						}
					}
				}

				if (!result.selectedOrganization) {
					return new Response('No organization selected', { status: 200 });
				}

				const subscriptions = await ApiConvex.v
					.OrganizationMemberSlackSubscription
					.list({
						where: {
							organizationMember: actorOrganizationMember._id,
						},
						include: {
							organization: true,
							project: true,
						},
					}).unwrapOrThrow();

				const hasExistingSubscription = subscriptions.some(
					(subscription) => {
						return (
							subscription.organization._id === result.selectedOrganization &&
							(result.selectedProject ?
								subscription.project?._id === result.selectedProject :
								!subscription.project)
						);
					},
				);

				if (hasExistingSubscription) {
					return new Response('This channel is already subscribed', {
						status: 400,
					});
				}

				const { channelId, userId, channelName } = destr(
					parsedPayload.view.private_metadata,
				) as any;

				(await ApiConvex.v.OrganizationMemberSlackSubscription.create({
					input: {
						data: {
							organization: result.selectedOrganization as Id<'Organization'>,
							project: result.selectedProject ?
								result.selectedProject as Id<'Project'> :
								null,
							organizationMember: actorOrganizationMember._id,
							channelId,
							channelName,
						},
					},
				})).unwrapOrThrow();

				const organization = organizations.find((organization) =>
					organization._id === result.selectedOrganization
				);

				if (!organization) {
					return new Response('Unable to find organization', { status: 200 });
				}

				const project = organization.projects.find((project) =>
					project._id === result.selectedProject
				);

				await slackClient.chat.postEphemeral({
					channel: channelId,
					user: userId,
					text: `Subscribed to \`${organization.name}${
						project ? `/${project.name}` : ''
					}\``,
				});

				return NextResponse.json({
					response_action: 'clear',
				}, { status: 200 });
			}

			default: {
				return sendSlackResponse(SlackAuthenticationStatus.Empty);
			}
		}

		return sendSlackResponse(SlackAuthenticationStatus.Empty);
	} catch (error: any) {
		logger.error(error.message);
		return new Response(error.message, { status: 500 });
	}
}
