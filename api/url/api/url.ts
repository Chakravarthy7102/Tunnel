import { ApiUrl } from '#api';
import { getHostnameFromRelease } from '@-/env/app';
import type { Release } from '@tunnel/release';
import queryString from 'query-string';

export const ApiUrl_getTunnelWebsiteScheme = () => 'https';

export function ApiUrl_getTunnelappUrl(
	args: {
		withScheme: boolean | string;
		subdomain?: string | null;
		query?: Record<string, string>;
		path?: string;
		release?: Release;
	},
): string;
export function ApiUrl_getTunnelappUrl(
	// eslint-disable-next-line @typescript-eslint/unified-signatures -- Overloads are more readable
	args:
		& {
			withScheme: boolean | string;
			projectLivePreviewUrl: string;
			query?: Record<string, string>;
			path?: string;
			release?: Release;
		}
		& (
			| {
				port?: number;
			}
			| {
				localUrl: string;
			}
		),
): string;
export function ApiUrl_getTunnelappUrl(
	args:
		& {
			withScheme: boolean | string;
			query?: Record<string, string>;
			path?: string;
			release?: Release;
		}
		& (
			| {
				subdomain?: string | null;
			}
			| (
				& {
					projectLivePreviewUrl: string;
				}
				& (
					| {
						port?: number;
					}
					| { localUrl: string }
				)
			)
		),
) {
	let hostname: string = getHostnameFromRelease({
		sld: 'tunnelapp',
		release: args.release,
	});
	let url: string;

	const subdomain = (() => {
		if ('subdomain' in args && args.subdomain !== undefined) {
			return args.subdomain;
		}

		if ('port' in args && args.port !== undefined) {
			return `${
				args.projectLivePreviewUrl.replace('.tunnelapp.dev', '')
			}--${args.port}`;
		} else if ('localUrl' in args) {
			return `${
				args.projectLivePreviewUrl.replace(
					'.tunnelapp.dev',
					'',
				)
			}--${args.localUrl.replaceAll('.', '-')}`;
		} else if ('projectLivePreviewUrl' in args) {
			return args.projectLivePreviewUrl.replace('.tunnelapp.dev', '');
		}

		return null;
	})();

	if (subdomain !== null) {
		hostname = subdomain + '.' + hostname;
	}

	if (args.withScheme) {
		url = (typeof args.withScheme === 'string' ?
			args.withScheme :
			ApiUrl.getTunnelWebsiteScheme()) +
			'://' +
			hostname;
	} else {
		url = hostname;
	}

	if (args.path !== undefined) {
		url += args.path.startsWith('/') ? args.path : `/${args.path}`;
	}

	if (args.query !== undefined) {
		url += `?${queryString.stringify(args.query)}`;
	}

	return url;
}
