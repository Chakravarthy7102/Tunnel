import { redirect } from 'next/navigation';
import VerifyEmailClientPage from './page.client.tsx';

export default function VerifyEmailPage({ searchParams }: {
	searchParams: {
		next?: string;
		'pending-authentication-token'?: string;
		email: string;
	};
}) {
	const pendingAuthenticationToken =
		searchParams['pending-authentication-token'];
	const next = searchParams.next ?? null;
	const { email } = searchParams;

	if (pendingAuthenticationToken === undefined) {
		return redirect('/login');
	}

	return (
		<VerifyEmailClientPage
			next={next}
			pendingAuthenticationToken={pendingAuthenticationToken}
			email={email}
		/>
	);
}
