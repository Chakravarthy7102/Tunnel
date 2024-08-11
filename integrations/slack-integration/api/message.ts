import { ApiSlack } from '#api';
import { ApiAnalytics } from '@-/analytics/api';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { RELEASE } from '@-/env/app';
import { DocumentNotFoundError } from '@-/errors';
import { ApiUrl } from '@-/url/api';
import type { ActionsBlock, Overflow } from '@slack/web-api';
import dayjs from 'dayjs';
import { $try, err, ok } from 'errok';
import { fileTypeFromBuffer } from 'file-type';
import { Buffer } from 'node:buffer';

export const ApiSlack_createMessage = (
	{
		organizationMemberId,
		content,
		channelId,
		channelName,
		attachments,
		projectId,
		commentThreadId,
	}: {
		organizationMemberId: Id<'OrganizationMember'>;
		content: string;
		channelId: string;
		channelName: string;
		attachments: string[];
		projectId: Id<'Project'>;
		commentThreadId: Id<'ProjectCommentThread'>;
		tunnelUrl?: string;
	},
) => ($try(async function*() {
	const webappUrl = ApiUrl.getWebappUrl({
		fromRelease: RELEASE,
		withScheme: true,
	});
	const slackClient = yield* ApiSlack.getClient({
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

	const project = yield* ApiConvex.v.Project.get({
		from: { id: projectId },
		include: {},
	}).safeUnwrap();

	if (project === null) {
		return err(new DocumentNotFoundError('Project'));
	}

	const commentThread = yield* ApiConvex.v.ProjectCommentThread.get({
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

	if (commentThread === null) {
		return err(new DocumentNotFoundError('ProjectCommentThread'));
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

				const uploadedImage = await slackClient.files.uploadV2({
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

		const commentThreadUrl =
			`${webappUrl}/${organizationMember.organization.slug}/comments/${commentThread._id}`;

		const projectUrl =
			`${webappUrl}/${organizationMember.organization.slug}/projects/${project.slug}`;

		const response = await slackClient.chat.postMessage({
			channel: channelId,
			text:
				`*${organizationMember.user.fullName}* left a comment on <${projectUrl}|${project.name}> ${images}`,
			mrkdwn: true,
			unfurl_links: false,
			unfurl_media: false,
			attachments: [
				{
					color: '#3662E3',
					blocks: [
						{
							type: 'section',
							text: {
								type: 'mrkdwn',
								text: content,
							},
						},
						{
							type: 'context',
							elements: [
								{
									type: 'mrkdwn',
									text: `<${commentThreadUrl}|View in Dashboard> | ${
										dayjs(commentThread._creationTime).format('MMM D h:mm A')
									}`,
								},
							],
						},
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
								// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- todo
								...(commentThread.linearIssueRelation ||
										commentThread.jiraIssueRelation ?
									[{
										type: 'overflow',
										options: [
											...(commentThread.linearIssueRelation ?
												[{
													text: {
														type: 'plain_text',
														text: 'View Linear Issue',
													},
													url: commentThread.linearIssueRelation
														.projectLinearIssue.issueUrl,
												}] as Overflow['options'] :
												[]),
											...(commentThread.jiraIssueRelation ?
												[{
													text: {
														type: 'plain_text',
														text: 'View Jira Issue',
													},
													url: commentThread.jiraIssueRelation
														.projectJiraIssue.url,
												}] as Overflow['options'] :
												[]),
										],
									}] as ActionsBlock['elements'] :
									[]),
							],
						},
					],
				},
			],
		});

		if (!response.ok || !response.ts) {
			throw new Error(`Failed to post message: ${JSON.stringify(response)}`);
		}

		const { permalink } = await slackClient.chat.getPermalink({
			channel: channelId,
			message_ts: response.ts,
		});

		if (!permalink) {
			return err(
				new Error(`Failed to get permalink: ${JSON.stringify(response)}`),
			);
		}

		const serverAnalytics = ApiAnalytics.getServerAnalytics();
		void serverAnalytics.user.createdSlackBroadcast({
			userId: organizationMember.user._id,
			organizationId: organizationMember.organization._id,
		});

		return ok({
			channelId,
			messageId: response.ts,
			permalink,
			channelName,
			parentTS: response.ts,
		});
	} catch (error: any) {
		return err(new Error(error));
	}
}));
