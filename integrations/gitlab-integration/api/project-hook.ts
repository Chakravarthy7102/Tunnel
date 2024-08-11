import type { Id } from '@-/database';
import { RELEASE } from '@-/env/app';
import { $try, ok } from 'errok';
import { ApiGitlab } from './_.ts';

export const ApiGitlab_createProjectHook = (
	{ organizationMemberId, organizationId, gitlabProjectId }: {
		organizationMemberId: Id<'OrganizationMember'>;
		organizationId: Id<'Organization'>;
		gitlabProjectId: number;
	},
) => ($try(async function*() {
	const { accessToken } = yield* ApiGitlab.getAccessToken({
		organizationMemberId,
	}).safeUnwrap();

	const baseUrl = RELEASE === null ?
		'https://84f9-69-181-44-113.ngrok-free.app' :
		'https://tunnel.dev';

	const body = {
		url: `${baseUrl}/api/webhooks/gitlab?organizationId=${organizationId}`,
		merge_requests_events: true,
		job_events: true,
		pipeline_events: true,
		access_token: accessToken,
	};

	const response = await fetch(
		`https://gitlab.com/api/v4/projects/${gitlabProjectId}/hooks`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		},
	);

	if (!response.ok) {
		throw new Error('Failed to create project hook');
	}

	const result = await response.json();

	return ok(result);
}));
