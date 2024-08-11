import { ApiSlack } from '#api';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import type { ChatPostMessageResponse } from '@slack/web-api';
import { $try, err, ok } from 'errok';
import { fileTypeFromBuffer } from 'file-type';
import { Buffer } from 'node:buffer';

export const ApiSlack_createReply = ({
	organizationMemberId,
	content,
	attachments,
	commentThreadId,
}: {
	organizationMemberId: Id<'OrganizationMember'>;
	content: string;
	attachments: string[];
	commentThreadId: Id<'ProjectCommentThread'>;
}) => ($try(async function*() {
	const organizationSlackClient = yield* ApiSlack.getClient({
		organizationMemberId,
		asBot: true,
	}).safeUnwrap();

	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: { id: organizationMemberId },
		include: {
			user: true,
			organization: true,
			linkedSlackAccount: true,
		},
	}).safeUnwrap();

	if (organizationMember === null) {
		return err(new DocumentNotFoundError('OrganizationMember'));
	}

	const parentCommentThread = yield* ApiConvex.v.ProjectCommentThread.get({
		from: { id: commentThreadId },
		include: {
			linearIssueRelation: {
				include: {
					projectLinearIssue: true,
				},
			},
			jiraIssueRelation: {
				include: {
					projectJiraIssue: true,
				},
			},
		},
	}).safeUnwrap();

	if (parentCommentThread === null) {
		return err(new DocumentNotFoundError('ProjectCommentThread'));
	}

	if (!parentCommentThread.slackMetadata) {
		return ok(null);
	}

	try {
		const permalinks = await Promise.all(
			attachments.map(async (attachment) => {
				const response = await fetch(attachment).then(async (res) =>
					res.arrayBuffer()
				);

				const fileType = await fileTypeFromBuffer(response);

				if (!fileType) {
					throw new Error('Failed to get file type');
				}

				const uploadedImage = await organizationSlackClient.files.uploadV2({
					filename: `Attachment ${
						attachments.indexOf(attachment) + 1
					}.${fileType.ext}`,
					file: Buffer.from(response),
				});

				// @ts-expect-error: types are outdated
				return uploadedImage.files[0].files[0].permalink;
			}),
		);

		const images = permalinks.map((permalink) => `<${permalink}| >`).join('');

		let response: ChatPostMessageResponse;

		if (organizationMember.linkedSlackAccount?.accessToken) {
			const personalSlackClient = yield* ApiSlack.getClient({
				organizationMemberId,
			}).safeUnwrap();

			response = await personalSlackClient.chat.postMessage({
				channel: parentCommentThread.slackMetadata.channelId,
				text: `${content} ${images}`,
				thread_ts: parentCommentThread.slackMetadata.parentTS,
				unfurl_links: false,
				unfurl_media: false,
			});
		} else {
			response = await organizationSlackClient.chat.postMessage({
				channel: parentCommentThread.slackMetadata.channelId,
				text: `${content} ${images}`,
				thread_ts: parentCommentThread.slackMetadata.parentTS,
				unfurl_links: false,
				unfurl_media: false,
			});
		}

		if (!response.ok || !response.ts) {
			throw new Error(`Failed to post message: ${JSON.stringify(response)}`);
		}

		if (!response.message || !response.message.ts || !response.message.user) {
			return err(
				new Error('Could not find message timestamp or message author'),
			);
		}

		return ok({
			messageTS: response.message.ts,
			userId: response.message.user,
		});
	} catch (error: any) {
		return err(new Error(error));
	}
}));
