'use client';

import { ApiCookies } from '@-/cookies/api';
import { TunnelToolbar } from '@-/react-package';
import { staffWorkosUserIds } from '@-/staff-users';
import type { Release } from '@tunnel/release';
import { parse as parseCookie } from 'cookie-es';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

export function StaffTunnelToolbar() {
	const [shouldShowToolbar, setShouldShowToolbar] = useState(false);
	const [projectId, setProjectId] = useState<string | null>(null);
	const [toolbarRelease, setToolbarRelease] = useState<Release | null>(
		null,
	);

	useEffect(() => {
		if (window.location.hostname === 'tunneldev.test') {
			setShouldShowToolbar(true);
			setToolbarRelease(null);
			setProjectId(null);
		} else if (window.location.hostname === 'tunnel.test') {
			// We use the production toolbar by default in localhost
			setShouldShowToolbar(true);
			setToolbarRelease('production');
			setProjectId('drx3fb72ssyqve5pf5u7zv6a');
		} else if (
			window.location.hostname === 'staging.tunnel.dev' ||
			window.location.hostname.endsWith('.vercel.app')
		) {
			// We should always show the toolbar on staging or preview deployments
			setShouldShowToolbar(true);
			setToolbarRelease('staging');
			setProjectId('drx3fb72ssyqve5pf5u7zv6a');
		} else {
			const tunnelCookies = ApiCookies.get();
			const accessToken =
				// eslint-disable-next-line no-restricted-globals -- We need `document` to access browser cookies
				parseCookie(document.cookie)[tunnelCookies.accessToken.name];

			if (accessToken !== undefined) {
				const { sub } = jwtDecode(accessToken);

				if (sub !== undefined && staffWorkosUserIds.has(sub)) {
					setShouldShowToolbar(true);
					setToolbarRelease('production');
					setProjectId('drx3fb72ssyqve5pf5u7zv6a');
				}
			}
		}
	}, []);

	if (!shouldShowToolbar) {
		return null;
	}

	return (
		<TunnelToolbar
			// @ts-expect-error: Can be `null` in development
			projectId={projectId}
			release={toolbarRelease}
		/>
	);
}
