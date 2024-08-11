import type { tunnelCookiesData } from '#data/cookies.ts';
import { parse as parseCookie } from 'cookie-es';
import mapObject from 'map-obj';
import { getTunnelCookiePrefix } from './prefix.ts';

/**
	Returns an object with only tunnel cookies
*/
export function parseTunnelCookies({
	cookieString,
}: {
	cookieString: string;
}): { [K in keyof typeof tunnelCookiesData]?: string } {
	return mapObject(parseCookie(cookieString), (cookieName, cookieValue) => [
		cookieName.replace(getTunnelCookiePrefix(), ''),
		cookieValue,
	]);
}
