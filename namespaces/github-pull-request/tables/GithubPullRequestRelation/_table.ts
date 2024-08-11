import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const GithubPullRequestRelation = table(
	'GithubPullRequestRelation',
	v.object({
		project: v.id('Project'),
		githubPullRequest: v.id('GithubPullRequest'),

		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_project', ['project'])
			.index('by_githubPullRequest', ['githubPullRequest']),
)({
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
	githubPullRequest: {
		foreignTable: 'GithubPullRequest',
		hostIndex: 'by_githubPullRequest',
		onDelete: 'Cascade',
	},
});
