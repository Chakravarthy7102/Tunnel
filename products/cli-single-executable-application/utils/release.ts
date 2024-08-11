import { APP_ENV } from '@-/env/app';
import { type Release, releaseSchema } from '@tunnel/release';

export function getRelease(): Release {
	if (APP_ENV === 'production') {
		const releaseParseResult = releaseSchema.safeParse(
			process.env.TUNNEL_RELEASE,
		);

		if (!releaseParseResult.success) {
			return 'production';
		}

		return releaseParseResult.data;
	} else {
		return null;
	}
}
