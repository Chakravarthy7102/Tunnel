import { StaffTunnelToolbar } from '#components/staff-tunnel-toolbar.tsx';
import { Analytics } from '@vercel/analytics/react';
import { encrypt, type FlagValuesType } from '@vercel/flags';
import { FlagValues } from '@vercel/flags/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Suspense } from 'react';

async function ConfidentialFlagValues({ values }: { values: FlagValuesType }) {
	const encryptedFlagValues = await encrypt(values);
	return <FlagValues values={encryptedFlagValues} />;
}

export function Head() {
	return (
		<head>
			<link rel="shortcut icon" href="/assets/images/favicon.ico" />
			<link
				rel="apple-touch-icon"
				sizes="180x180"
				href="/assets/images/apple-touch-icon.png"
			/>
			<link
				rel="icon"
				type="image/png"
				sizes="32x32"
				href="/assets/images/favicon-32x32.png"
			/>
			<link
				rel="icon"
				type="image/png"
				sizes="16x16"
				href="/assets/images/favicon-16x16.png"
			/>
			<StaffTunnelToolbar />
			<SpeedInsights />
			<Analytics />
			<Suspense fallback={null}>
				<ConfidentialFlagValues values={{ 'ui-v2': true }} />
			</Suspense>
		</head>
	);
}
