import { v } from '@-/convex/values';
import { table, vDeprecated, vNew, vNullable } from 'corvex';

export const GithubPullRequest = table(
	'GithubPullRequest',
	v.object({
		branch: v.string(),
		pullRequestId: v.number(),
		isOpen: v.boolean(),
		issueNumber: v.number(),
		commentId: v.number(),
		checkRunId: vNew(vNullable(v.number())),
		ownerLogin: v.string(),
		repoName: v.string(),
		repoId: v.number(),
		senderId: vNew(vNullable(v.number())),

		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_pullRequestId', ['pullRequestId']),
)({
	senderId: { default: () => null },
	checkRunId: { default: () => null },
});
