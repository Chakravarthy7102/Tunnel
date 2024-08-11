import { APP_ENV } from '@-/env/app';
// @ts-expect-error: missing types
import isLocalIp from 'is-local-ip';

export function isLocalUrl({
	url,
}: {
	url: globalThis.URL;
}) {
	// Non-local URLs cannot have port numbers
	if (url.port !== '') {
		return true;
	}

	if (isLocalIp(url.hostname)) {
		return true;
	}

	// In development, "tunnel.test" and "tunnelapp.test" domains are considered non-local URLs since they serve the Tunnel API endpoint
	if (
		APP_ENV === 'development' &&
		(url.hostname === 'tunnelapp.test' ||
			url.hostname.endsWith('.tunnelapp.test') ||
			url.hostname === 'tunnel.test' ||
			url.hostname.endsWith('.tunnel.test'))
	) {
		return false;
	}

	return (
		url.hostname === 'localhost' ||
		url.hostname.endsWith('.test') ||
		url.hostname.endsWith('.test') ||
		url.hostname.endsWith('.localhost') ||
		url.hostname.endsWith('.example') ||
		url.hostname.endsWith('.invalid')
	);
}
