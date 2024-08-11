import type { Id } from '@-/database';
import { $try, err, ok } from 'errok';
import { ApiGitlab } from './_.ts';

export const ApiGitlab_checkCommitStatus = (
	{
		organizationMemberId,
		gitlabProjectId,
		sourceBranch,
		commitSha,
		state,
	}: {
		organizationMemberId: Id<'OrganizationMember'>;
		gitlabProjectId: number;
		sourceBranch: string;
		commitSha: string;
		state: 'success' | 'failed';
	},
) => ($try(async function*() {
	const { accessToken } = yield* ApiGitlab.getAccessToken({
		organizationMemberId,
	}).safeUnwrap();

	const response = await fetch(
		`https://gitlab.com/api/v4/projects/${gitlabProjectId}/statuses/${commitSha}?access_token=${accessToken}`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				ref: sourceBranch,
				name: 'Tunnel Feedback',
				state,
			}),
		},
	);

	if (!response.ok) {
		return err(new Error('Could not check commit status'));
	}

	const result = await response.json();
	return ok(result);
}));
