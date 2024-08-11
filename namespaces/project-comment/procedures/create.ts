import { ApiProjectComment } from '#api';
import { projectCommentContentSchema } from '#schemas/content.ts';
import { ProcedureError } from '@-/errors';
import { projectCommentThreadGitMetadataSchema } from '@-/git-metadata/schemas';
import { hostEnvironmentTypeSchema } from '@-/host-environment/schemas';
import {
	createdJiraIssueSchema,
	createdLinearIssueSchema,
	createdSlackMessageSchema,
} from '@-/integrations/schemas';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { windowMetadataSchema } from '@-/window-metadata/schemas';
import { z } from '@-/zod';
import { $try } from 'errok';

export const projectComment_create = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			authorUser: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			content: z.array(projectCommentContentSchema),
			contentTextContent: z.string(),
			files: WebappApiInput.files()(input, ctx),
			parentCommentThread: WebappApiInput.projectCommentThread({
				actor,
				actorRelation: 'hasProjectLivePreviewPermission',
			})(input, ctx),
			hostEnvironmentType: hostEnvironmentTypeSchema.nullable(),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const authorUserId = yield* input.authorUser.safeUnwrap();
		const parentCommentThreadId = yield* input.parentCommentThread
			.safeUnwrap();
		const { files } = input;

		return ApiProjectComment.create({
			input: {
				data: {
					authorUserId,
					parentCommentThreadId,
					content: input.content,
					contentTextContent: input.contentTextContent,
					fileIds: files,
					sentBySlack: false,
				},
				include: {},
			},
			hostEnvironmentType: input.hostEnvironmentType,
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't create comment", error),
});

export const projectComment_createWithThread = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			authorUser: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			projectLivePreview: WebappApiInput.projectLivePreview({
				identifier: 'id',
				actor,
				actorRelation: 'hasPermission',
			})(input, ctx).nullable(),
			content: z.array(projectCommentContentSchema),
			contentTextContent: z.string(),
			files: WebappApiInput.files()(input, ctx),
			anchorElementXpath: z.string().nullable(),
			percentageTop: z.number(),
			percentageLeft: z.number(),
			route: z.string(),
			createdJiraIssue: createdJiraIssueSchema.nullable(),
			createdLinearIssue: createdLinearIssueSchema.nullable(),
			createdSlackMessage: createdSlackMessageSchema.nullable(),
			windowMetadata: windowMetadataSchema.nullable(),
			gitMetadata: projectCommentThreadGitMetadataSchema.nullable(),
			hostEnvironmentType: hostEnvironmentTypeSchema.nullable(),
			consoleLogsFile: WebappApiInput.file()(input, ctx).nullable(),
			consoleLogEntriesCount: z.number(),
			networkLogEntriesFile: WebappApiInput.file()(input, ctx).nullable(),
			networkLogEntriesCount: z.number(),
			sessionEventsFile: WebappApiInput.file()(input, ctx).nullable(),
			sessionEventsThumbnailFile: WebappApiInput.file()(input, ctx).nullable(),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const authorUserId = yield* input.authorUser.safeUnwrap();
		const projectId = yield* input.project.safeUnwrap();
		const { files } = input;
		const projectLivePreviewId = input.projectLivePreview ?
			yield* input.projectLivePreview.safeUnwrap() :
			null;

		const sessionEventsFileId = input.sessionEventsFile;
		const sessionEventsThumbnailFileId = input.sessionEventsThumbnailFile;
		const consoleLogsFileId = input.consoleLogsFile;
		const networkLogEntriesFileId = input.networkLogEntriesFile;

		const {
			authorUser: _authorUser,
			project: _project,
			files: _files,
			projectLivePreview: _projectLivePreview,
			...createInput
		} = input;

		return ApiProjectCommentThread.create({
			projectLivePreviewId,
			projectId,
			authorUserId,
			fileIds: files,
			sessionEventsFileId,
			sessionEventsThumbnailFileId,
			consoleLogsFileId,
			networkLogEntriesFileId,
			...createInput,
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't create comment", error as Error),
});
