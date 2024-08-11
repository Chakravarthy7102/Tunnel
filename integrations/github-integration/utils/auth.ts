import { RELEASE } from '@-/env/app';

export function getGithubAuthUrl({
	organizationId,
	redirectPath,
	organizationMemberId,
}: {
	organizationId: string;
	redirectPath: string | null;
	organizationMemberId: string;
}) {
	const appSlug = RELEASE === null ?
		'tunnel-laboratories-development' :
		'tunnel-laboratories';

	const state = JSON.stringify({
		organizationId,
		redirectPath,
		organizationMemberId,
	});

	return `https://github.com/apps/${appSlug}/installations/new?state=${
		encodeURIComponent(state)
	}`;
}
