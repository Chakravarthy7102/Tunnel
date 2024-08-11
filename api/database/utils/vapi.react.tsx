'use client';

import { getBundledDatabaseApiVersion } from '#constants/api-version.ts';
import type { api } from '#types';
import { createVapi } from '#utils/vapi.ts';
import { RELEASE } from '@-/env/app';
import { ApiUrl } from '@-/url/api';
import {
	createContext,
	type PropsWithChildren,
	useContext,
	useState,
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const VapiContext = createContext<typeof api | null>(null);

export function useVapi(): typeof api {
	const vapi = useContext(VapiContext);
	if (vapi === null) {
		throw new Error('useVapi must be used within a VapiProvider');
	}

	return vapi;
}

export function VapiProvider({ children }: PropsWithChildren) {
	const [vapi, setVapi] = useState(() =>
		createVapi(getBundledDatabaseApiVersion())
	);

	return (
		<ErrorBoundary
			fallback={null}
			onError={async (error) => {
				if (error.message.includes("Could not find public function for 'v")) {
					const currentVersion = error.message.match(/'v(\d+)'/)?.[1];
					// Fetch the latest database version and update `vapi`
					const response = await fetch(ApiUrl.getWebappUrl({
						withScheme: true,
						fromRelease: RELEASE,
						path: '/api/cli-metadata',
					}));
					const result = await response.json();
					if (result['@-/database'].version === currentVersion) {
						throw error;
					}

					setVapi(createVapi(result['@-/database'].version));
				}
			}}
		>
			<VapiContext.Provider value={vapi}>
				{children}
			</VapiContext.Provider>
		</ErrorBoundary>
	);
}
