/** @type {null | 'staging' | 'production'} */
export const RELEASE = (() => {
	const release = process.env.NEXT_PUBLIC_TUNNEL_RELEASE ??
		process.env.TUNNEL_RELEASE ?? globalThis.TUNNEL_RELEASE;

	if (release === undefined) {
		// eslint-disable-next-line no-undef -- We don't want to log this warning in Convex
		if (typeof document !== 'undefined') {
			// eslint-disable-next-line no-console -- Don't want to use logger here
			console.warn(
				'`RELEASE` not found in environment, defaulting to `null`',
			);
		}

		return null;
	}

	return release === 'development' ? null : release;
})();

/** @type {'development' | 'test' | 'production'} */
export const APP_ENV = (() => {
	const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? process.env.APP_ENV;

	if (appEnv === undefined) {
		// eslint-disable-next-line no-undef -- We don't want to log this warning in Convex
		if (typeof document !== 'undefined') {
			// eslint-disable-next-line no-console -- Don't want to use logger here
			console.warn(
				'`APP_ENV` not found in environment, defaulting to "development"',
			);
		}

		return 'development';
	}

	return appEnv;
})();

export function getEnvironmentFromAppEnv() {
	return APP_ENV === 'production' ?
		'production' :
		APP_ENV === 'test' ?
		'ci' :
		'development';
}

export function getHostnameFromRelease({ sld, release }) {
	release ??= RELEASE;

	switch (release) {
		case null: {
			return `${sld}.test`;
		}

		case 'staging': {
			return `staging.${sld}.dev`;
		}

		case 'production': {
			return `${sld}.dev`;
		}

		default: {
			throw new Error(`Invalid release: ${release}`);
		}
	}
}

export function getHostnameFromHeaders(headers) {
	const hostname = headers.get('x-forwarded-host') ?? headers.get('host');
	if (hostname === null) {
		throw new Error('Hostname not found in headers');
	}

	// dprint-ignore
	return (
		hostname === 'webapp.tunnel.dev' ?
			'tunnel.dev' :
		hostname === 'tunnel-webapp-git-release-tunnel-labs.vercel.app' ?
			'staging.tunnel.dev' :
		hostname
	);
}

export function getHostnameFromWindow(providedWindow) {
	const windowToUse = typeof providedWindow === 'string' ?
		// eslint-disable-next-line no-undef -- Will be defined
		window :
		providedWindow;

	if (windowToUse === undefined) {
		return getHostnameFromRelease(RELEASE);
	}

	return windowToUse.location.hostname;
}
