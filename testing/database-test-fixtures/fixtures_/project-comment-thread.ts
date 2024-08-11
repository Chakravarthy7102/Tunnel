import type { FixtureKeyOfType } from '#types';
import { defineFixture } from '#utils/define.ts';
import { deleteIgnoringNonexistentError } from '#utils/delete.ts';
import type { DocBase } from '@-/database';
import { ApiProjectCommentThread } from '@-/project-comment-thread/api';

export const ProjectCommentThread = <
	$TestSlug extends string,
	$FixturesSpecInput,
>(
	_testSlug: $TestSlug,
) => (defineFixture({
	async create({
		project: projectKey,
		authorUser: authorUserKey,
	}: {
		project: FixtureKeyOfType<$FixturesSpecInput, 'Project'>;
		authorUser: FixtureKeyOfType<$FixturesSpecInput, 'User'>;
	}): Promise<DocBase<'ProjectCommentThread'>> {
		const project = await this.getFixture<'Project'>(projectKey);
		const authorUser = await this.getFixture<'User'>(authorUserKey);

		return ApiProjectCommentThread.create({
			projectId: project._id,
			projectLivePreviewId: null,
			content: [],
			contentTextContent: 'Test comment',
			anchorElementXpath: null,
			percentageLeft: 0,
			percentageTop: 0,
			route: '/',
			fileIds: [],
			createdJiraIssue: null,
			createdLinearIssue: null,
			createdSlackMessage: null,
			authorUserId: authorUser._id,
			windowMetadata: null,
			gitMetadata: null,
			sessionEventsFileId: null,
			sessionEventsThumbnailFileId: null,
			networkLogEntriesFileId: null,
			consoleLogsFileId: null,
			hostEnvironmentType: null,
			consoleLogEntriesCount: 0,
			networkLogEntriesCount: 0,
		}).unwrapOrThrow();
	},
	async destroy(projectCommentThread) {
		await deleteIgnoringNonexistentError(
			ApiProjectCommentThread.delete({
				input: { id: projectCommentThread._id },
			}),
		);
	},
}));
