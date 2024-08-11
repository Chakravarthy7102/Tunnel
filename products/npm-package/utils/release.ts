import { APP_ENV } from '@-/env/app';
import type { Release } from '@tunnel/release';

export function getRelease(): Release {
	if (APP_ENV === 'production') {
		const release = process.env.TUNNEL_RELEASE;
		return release === 'staging' ? 'staging' : 'production';
	}

	return null;
}
