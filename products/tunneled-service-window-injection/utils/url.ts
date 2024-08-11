import { RELEASE } from '@-/env/app';
import { getHostnameType } from '@-/host-environment';
import { ApiUrl } from '@-/url/api';
import { unreachableCase } from '@tunnel/ts';

export function getTunneledServiceWindowInjectionJavascriptUrl({
	hostUrl,
}: {
	hostUrl: globalThis.URL;
}) {
	const hostnameType = getHostnameType({ origin: hostUrl.origin });

	switch (hostnameType) {
		case 'local': {
			return `${hostUrl.origin}/__tunnel/injection.js`;
		}

		case 'script.js': {
			return ApiUrl.getWebappUrl({
				fromRelease: RELEASE,
				withScheme: true,
				path: '/__tunnel/injection.js',
			});
		}

		case 'tunnelapp': {
			return ApiUrl.getWebappUrl({
				fromRelease: RELEASE,
				withScheme: true,
				path: '/__tunnel/injection.js',
			});
		}

		default: {
			return unreachableCase(hostnameType);
		}
	}
}
