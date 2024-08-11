import type { FixtureKeyOfType } from '#types';
import { defineFixture } from '#utils/define.ts';
import { deleteIgnoringNonexistentError } from '#utils/delete.ts';
import { ApiConvex } from '@-/convex/api';
import { type DocBase } from '@-/database';
import { ApiProjectComment } from '@-/project-comment';

export const ProjectComment = <
	$TestSlug extends string,
	$FixturesSpecInput,
>(
	_testSlug: $TestSlug,
) => (defineFixture({
	async create({
		parentCommentThread: parentCommentThreadKey,
		authorUser: authorUserKey,
	}: {
		parentCommentThread: FixtureKeyOfType<
			$FixturesSpecInput,
			'ProjectCommentThread'
		>;
		authorUser: FixtureKeyOfType<$FixturesSpecInput, 'User'>;
	}): Promise<DocBase<'ProjectComment'>> {
		const projectCommentThread = await this.getFixture<'ProjectCommentThread'>(
			parentCommentThreadKey,
		);
		const authorUser = await this.getFixture<'User'>(authorUserKey);

		return ApiProjectComment.create({
			input: {
				data: {
					authorUserId: authorUser._id,
					content: [],
					contentTextContent: '',
					fileIds: [],
					parentCommentThreadId: projectCommentThread._id,
					sentBySlack: true,
				},
				include: {},
			},
			hostEnvironmentType: null,
		}).unwrapOrThrow();
	},
	async destroy(projectComment) {
		await deleteIgnoringNonexistentError(
			ApiConvex.v.ProjectComment.delete({ input: { id: projectComment._id } }),
		);
	},
}));
