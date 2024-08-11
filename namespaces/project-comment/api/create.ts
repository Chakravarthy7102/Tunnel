import { ApiAnalytics } from '@-/analytics/api';
import type { JSONContent } from '@-/comments';
import { extractMentionIds } from '@-/comments/utils';
import { ApiConvex } from '@-/convex/api';
import {
	type Id,
	type SelectInput,
	type SelectOutput,
} from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	getIncludes,
	ProjectCommentThread_$createdEventData,
} from '@-/database/selections';
import { DocumentNotFoundError, type UnexpectedError } from '@-/errors';
import type { HostEnvironmentType } from '@-/host-environment';
import { ApiSlack } from '@-/slack-integration/api';
import { $try, err, ok, type ResultAsync } from 'errok';

export const ApiProjectComment_create = <
	$Include extends SelectInput<'ProjectComment'>,
>({
	input: {
		data: {
			authorUserId,
			parentCommentThreadId,
			content,
			contentTextContent,
			fileIds,
			isParent,
			authorInformation,
			sentBySlack,
		},
		include,
	},
	hostEnvironmentType,
}: {
	// In case the project comment was already inserted
	input: {
		data: {
			authorUserId: Id<'User'>;
			content: JSONContent[];
			contentTextContent: string;
			parentCommentThreadId: Id<'ProjectCommentThread'>;
			fileIds: Id<'File'>[];
			isParent?: boolean;
			authorInformation?: {
				displayName: string;
				displayProfileImageUrl: string;
			};
			sentBySlack: boolean;
		};
		include: $Include;
	};
	hostEnvironmentType: HostEnvironmentType | null;
}): ResultAsync<
	SelectOutput<'ProjectComment', $Include>,
	UnexpectedError
> => ($try(async function*() {
	const includes = getIncludes();

	const parentThread = yield* ApiConvex.v.ProjectCommentThread.get({
		from: { id: parentCommentThreadId },
		include: includes(
			getInclude(ProjectCommentThread_$createdEventData),
			includes.ProjectCommentThread({
				comments: {
					include: {
						authorUser: true,
					},
				},
				project: {
					include: {
						organization: true,
					},
				},
			}),
		),
	}).safeUnwrap();

	if (parentThread === null) {
		return err(new DocumentNotFoundError('ProjectCommentThread'));
	}

	const authorUser = yield* ApiConvex.v.User.get({
		from: { id: authorUserId },
		include: {},
	}).safeUnwrap();

	if (authorUser === null) {
		return err(new DocumentNotFoundError('User'));
	}

	let slackMetadata: {
		messageTS: string;
		userId: string;
	} | null = null;
	if (!isParent && !sentBySlack && parentThread.slackMetadata) {
		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: {
				user: authorUserId,
				organization: parentThread.project.organization._id,
			},
			include: {},
		}).safeUnwrap();

		if (organizationMember !== null) {
			const slackReplyResult = yield* ApiSlack.createReply({
				organizationMemberId: organizationMember._id,
				content: contentTextContent,
				attachments: [], // Needs to be fixed to support attaching attachments
				commentThreadId: parentCommentThreadId,
			}).safeUnwrap();

			slackMetadata = slackReplyResult;
		}
	}

	const projectComment = yield* ApiConvex.v.ProjectComment._create({
		input: {
			data: {
				contentTextContent,
				parentCommentThread: parentCommentThreadId,
				authorUser: authorUserId,
				content,
				authorInformation,
				updatedAt: Date.now(),
				slackMetadata,
				sentBySlack,
			},
			files: fileIds,
			include: {
				...include,
				files: true,
			},
		},
	}).safeUnwrap();

	const mentionedUserIds: string[] = [];
	for (const block of content) {
		extractMentionIds(block, mentionedUserIds);
	}

	const parentOrganizationId = parentThread.project.organization._id;

	const serverAnalytics = ApiAnalytics.getServerAnalytics();
	await serverAnalytics.user.createdComment({
		userId: authorUserId,
		hostEnvironmentType,
		organizationId: parentOrganizationId,
		commentThreadId: projectComment._id,
	});

	return ok(projectComment);
}));
