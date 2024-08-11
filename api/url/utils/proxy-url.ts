import { tunnelappUrlMetadataSchema } from '#schemas/metadata.ts';
import type { ParsedTunnelappUrl, TunnelappUrlMetadata } from '#types';
import { getHostnameFromRelease, RELEASE } from '@-/env/app';
import destr from 'destru';
import queryString from 'query-string';
import safeUrl from 'safer-url';
import { isLocalUrl } from './local-url.ts';

export function parseTunnelappUrl(
	tunnelappUrl: globalThis.URL,
): ParsedTunnelappUrl {
	// Creating a copy of the URL to modify
	const url = safeUrl(tunnelappUrl);
	const query = queryString.parse(url.search);
	if (query.__tunnel__ === undefined) {
		return { url, metadata: null };
	}

	const metadata = tunnelappUrlMetadataSchema.parse(destr(query.__tunnel__));
	delete query.__tunnel__;

	url.search = queryString.stringify(query);
	return { url, metadata };
}

/**
	Converts a URL to a tunnelapp URL, if applicable. Metadata about the original URL is sent in a `__tunnel__` query parameter. Note that we don't use hashes because they aren't consistently sent to the server.
*/
export function toTunnelappUrl(
	args:
		& {
			originalUrl: globalThis.URL;
			projectLivePreview: {
				url: string;
			} | null;
		}
		& (
			| { type: 'proxy' }
			| { type: 'tunnel-instance-proxy-preview'; port: number }
		),
): globalThis.URL {
	const { originalUrl, projectLivePreview } = args;
	if (
		RELEASE === null &&
		(originalUrl.hostname === 'tunnel.test' ||
			originalUrl.hostname === 'tunnelapp.test')
	) {
		return originalUrl;
	}

	if (!isLocalUrl({ url: originalUrl })) {
		return originalUrl;
	}

	if (projectLivePreview === null) {
		return originalUrl;
	}

	const tunnelUrl = safeUrl(originalUrl);
	const tunnelAppHostname = getHostnameFromRelease({ sld: 'tunnelapp' });

	// A tunnelapp domain cannot have port numbers
	tunnelUrl.port = '';
	tunnelUrl.hostname = `${
		projectLivePreview.url.replace(
			'.tunnelapp.dev',
			'',
		)
	}.${tunnelAppHostname}`;

	// dprint-ignore
	tunnelUrl.protocol =
		tunnelUrl.protocol === 'http:' ?
			'https:' :
		tunnelUrl.protocol === 'ws:' ?
			'wss:' :
		tunnelUrl.protocol;

	const query = queryString.parse(tunnelUrl.search);
	const tunnelappUrlMetadata: TunnelappUrlMetadata = args.type === 'proxy' ?
		{
			type: 'proxy',
			originalUrl: originalUrl.toString(),
		} :
		{
			type: 'tunnel-instance-proxy-preview',
			originalUrl: originalUrl.toString(),
			port: args.port,
		};
	query.__tunnel__ = JSON.stringify(tunnelappUrlMetadata);
	tunnelUrl.search = queryString.stringify(query);

	return tunnelUrl;
}

export function isTunnelappUrl(url: globalThis.URL) {
	return (
		url.hostname.split('.').at(-2) === 'tunnelapp' &&
		'__tunnel__' in queryString.parse(url.search)
	);
}
