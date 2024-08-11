import type { HostnameType } from '#types';
import { isLocalUrl } from '@-/url';
import safeUrl from 'safer-url';

export function getHostnameType({ origin }: { origin: string }): HostnameType {
	if (
		origin.endsWith('.tunnelapp.dev') ||
		origin.endsWith('.tunnelapp.test')
	) {
		return 'tunnelapp';
	}

	const url = safeUrl(origin.toString());
	if (
		(url !== null && isLocalUrl({ url })) ||
		origin === 'https://tunnel.test'
	) {
		return 'local';
	}

	return 'script.js';
}
