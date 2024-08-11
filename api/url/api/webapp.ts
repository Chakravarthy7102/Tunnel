import { ApiUrl } from '#api';
import {
	getHostnameFromHeaders,
	getHostnameFromRelease,
	getHostnameFromWindow,
	RELEASE,
} from '@-/env/app';
import type { Release } from '@tunnel/release';
import queryString from 'query-string';

// dprint-ignore
type GetTunnelWebappUrlArgs =
	(
		{ fromHostname: string } |
		{ fromRelease: Release } |
		{ fromHeaders: Headers } |
		{ fromWindow: true }
	) & {
		withScheme: boolean | string;
		subdomain?: string;
		path?: string;
		query?: Record<string, string>;
	}

export function ApiUrl_webappUrlFactory(
	baseArgs: GetTunnelWebappUrlArgs,
) {
	return (
		path: string,
		query?: Record<string, string>,
	) =>
		ApiUrl.getWebappUrl(
			{
				...baseArgs,
				path,
				query: {
					...baseArgs.query,
					...query,
				},
			},
		);
}

export function ApiUrl_getWebappUrl(args: GetTunnelWebappUrlArgs) {
	let url: string;
	// dprint-ignore
	let hostname: string =
		'fromHostname' in args ?
			args.fromHostname :
		'fromHeaders' in args ?
			getHostnameFromHeaders(args.fromHeaders) :
		'fromWindow' in args && typeof window !== 'undefined' ?
			getHostnameFromWindow(window) :
		// @ts-expect-error: Will exist
		getHostnameFromRelease({ sld: 'tunnel', release: args.fromRelease ?? RELEASE });

	if (args.subdomain) {
		hostname = args.subdomain + '.' + hostname;
	}

	if (args.withScheme) {
		url = (typeof args.withScheme === 'string' ? args.withScheme : 'https') +
			'://' +
			hostname;
	} else {
		url = hostname;
	}

	if (args.path !== undefined) {
		url += args.path;
	}

	if (args.query !== undefined) {
		url += `?${queryString.stringify(args.query)}`;
	}

	return url;
}
