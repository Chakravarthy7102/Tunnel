import { getOauthUrls } from '#utils/auth.ts';
import { headers } from 'next/headers';
import SignupClientPage from './page.client.tsx';

export default async function SignupPage(
	{ searchParams }: { searchParams: { next?: string } },
) {
	const next = searchParams.next ?? null;
	const { githubOauthUrl, googleOauthUrl } = getOauthUrls({
		headers: headers(),
		next,
	});

	return (
		<SignupClientPage
			githubOauthUrl={githubOauthUrl}
			googleOauthUrl={googleOauthUrl}
			next={next}
		/>
	);
}
