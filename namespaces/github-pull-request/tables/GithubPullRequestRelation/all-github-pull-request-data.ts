import { defineSelection } from '@-/database/selection-utils';

export const GithubPullRequestRelation_$allGithubPullRequest = defineSelection(
	'GithubPullRequestRelation',
	() => ({
		githubPullRequest: true,
	}),
);
