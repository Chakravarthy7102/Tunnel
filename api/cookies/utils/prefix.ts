import { RELEASE } from '@-/env/app';

export function getTunnelCookiePrefix() {
	return `tunnel_${
		RELEASE === 'production' ? '' : `${RELEASE ?? 'development'}_`
	}`;
}
