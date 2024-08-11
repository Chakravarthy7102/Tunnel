import { redirect } from 'next/navigation';
import ResetPasswordClientPage from './page.client.tsx';

export default async function ResetPasswordPage(
	{ searchParams }: { searchParams: { token?: string; email?: string } },
) {
	if (!searchParams.token || !searchParams.email) {
		return redirect('/login');
	}

	return (
		<ResetPasswordClientPage
			token={searchParams.token}
			email={searchParams.email}
		/>
	);
}
