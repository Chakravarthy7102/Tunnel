import { getOauthUrls } from '#utils/auth.ts';
import { headers } from 'next/headers';
import LoginClientPage from './page.client.tsx';

export default async function LoginPage(
	{ searchParams }: { searchParams: { next?: string } },
) {
	const next = searchParams.next ?? null;
	const { githubOauthUrl, googleOauthUrl } = getOauthUrls({
		headers: headers(),
		next
	});

	return (
		<LoginClientPage
			githubOauthUrl={githubOauthUrl}
			googleOauthUrl={googleOauthUrl}
			next={next}
		/>
	);
}
