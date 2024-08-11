/* eslint-disable max-depth -- TODO */

import { ApiConvex } from '@-/convex/api';
import { HostEnvironmentType } from '@-/host-environment';
import { logger } from '@-/logger';
import { ApiProjectComment } from '@-/project-comment';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
	const body = await request.json();
	const { type } = body;

	switch (type) {
		case 'url_verification': {
			const { challenge } = body;
			return NextResponse.json({ challenge }, { status: 200 });
		}

		case 'event_callback': {
			const { event } = body;
			const { type } = event;

			// https://api.slack.com/events/message/message_replied for reference
			if (
				type === 'message' &&
				(event.subtype === 'message_replied' || event.thread_ts)
			) {
				const {
					thread_ts: parentThreadTimestamp,
					channel: channelId,
					text,
				} = event;

				const projectCommentThread = (await ApiConvex.v.ProjectCommentThread
					.get({
						from: {
							parentTS: parentThreadTimestamp, // <- theoretically unique
							channelId,
						},
						include: {
							organization: {
								include: {
									slackOrganization: true,
								},
							},
						},
					})).mapErr((_) => {
						logger.error(
							"(TWO-WAY-SYNC) Couldn't find the parent comment thread.",
						);
					}).unwrapOrThrow();

				if (!projectCommentThread) {
					logger.warn(
						"(TWO-WAY-SYNC) Couldn't find the parent comment thread.",
					);
					return NextResponse.json({}, { status: 200 });
				}

				if (!projectCommentThread.organization.slackOrganization?.accessToken) {
					return NextResponse.json({
						message: 'Organization does not have the slack integration',
					}, { status: 500 });
				}

				const alreadyPublishedTunnelMessageResponse = await ApiConvex.v
					.ProjectComment
					.get({
						from: {
							slackMessageTS: event.ts,
							slackId: event.user,
						},
						include: {},
					});

				if (alreadyPublishedTunnelMessageResponse.isOk()) {
					const alreadyPublishedTunnelMessage =
						alreadyPublishedTunnelMessageResponse.value;

					if (alreadyPublishedTunnelMessage) {
						return NextResponse.json({}, { status: 200 });
					} else if (projectCommentThread.slackMetadata) {
						const organizationMember = await ApiConvex.v.OrganizationMember.get(
							{
								from: {
									slackId: event.user,
								},
								include: { user: true },
							},
						).unwrapOrThrow();

						if (organizationMember) {
							const result = await ApiProjectComment.create({
								input: {
									data: {
										contentTextContent: text,
										authorUserId: organizationMember.user._id,
										parentCommentThreadId: projectCommentThread._id,
										content: [
											{
												content: event.blocks[0].elements[0].elements,
												type: 'paragraph',
											},
										], // Get actual types for this.
										fileIds: [],
										isParent: false,
										sentBySlack: true,
									},
									include: {},
								},
								hostEnvironmentType: HostEnvironmentType.dashboard,
							});

							if (result.isErr()) {
								logger.error(
									'(TWO-WAY-SYNC) Problem with creating Tunnel project comment:',
									result.error,
								);
							}
						} else {
							const botUser = await ApiConvex.v.User.get({
								from: { username: 'tunnel-bot' },
								include: {},
							}).unwrapOrThrow();

							const userInfoUnparsed = await fetch(
								'https://slack.com/api/users.info',
								{
									method: 'POST',
									headers: {
										'Content-Type': 'application/x-www-form-urlencoded',
									},
									body: new URLSearchParams({
										token: projectCommentThread.organization.slackOrganization
											.accessToken,
										user: event.user,
									}).toString(),
								},
							);

							const userInfo = await userInfoUnparsed.json();

							if (botUser !== null && userInfo.ok) {
								const result = await ApiProjectComment.create({
									input: {
										data: {
											contentTextContent: text,
											authorUserId: botUser._id,
											parentCommentThreadId: projectCommentThread._id,
											content: [
												{
													content: event.blocks[0].elements[0].elements,
													type: 'paragraph',
												},
											], // Get actual types for this.
											fileIds: [],
											isParent: false,
											authorInformation: {
												displayName: userInfo.user.real_name,
												displayProfileImageUrl: userInfo.user.profile.image_512,
											},
											sentBySlack: true,
										},
										include: {},
									},
									hostEnvironmentType: null,
								});
								if (result.isErr()) {
									logger.error(
										'(TWO-WAY-SYNC) Problem with creating Tunnel project comment:',
										result.error,
									);
								}

								return NextResponse.json({}, { status: 200 });
							} else {
								logger.error(
									'(TWO-WAY-SYNC) Bot user was null or Slack API had an issue with retrieval',
								);
							}
						}
					}
				} else {
					logger.warn(
						'(TWO-WAY-SYNC) Issue while trying to retrieve project comment',
					);
				}
			}

			return NextResponse.json({}, { status: 200 });
		}

		default: {
			logger.warn('Unrecognized Slack event received');

			return NextResponse.json({ error: body }, { status: 200 });
		}
	}
}
