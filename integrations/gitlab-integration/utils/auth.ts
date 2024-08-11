import type { Id } from '@-/database';
import { env } from '@-/env';
import { RELEASE } from '@-/env/app';

export function getGitlabAuthUrl({
	organizationId,
	redirectPath,
	organizationMemberId,
}: {
	organizationId: Id<'Organization'>;
	redirectPath: string | null;
	organizationMemberId: Id<'OrganizationMember'>;
}) {
	const redirectUri = RELEASE === null ?
		'https://tunnel.test/api/callbacks/gitlab' :
		'https://tunnel.dev/api/callbacks/gitlab';

	const applicationId = env('NEXT_PUBLIC_GITLAB_APP_CLIENT_ID');

	const state = JSON.stringify({
		organizationId,
		redirectPath,
		organizationMemberId,
	});

	const scope = 'api+read_api+read_user';

	return `https://gitlab.com/oauth/authorize?client_id=${applicationId}&redirect_uri=${redirectUri}&response_type=code&state=${
		encodeURIComponent(state)
	}&scope=${scope}`;
}
