import { tunnelCookiesData } from '#data/cookies.ts';
import { getTunnelCookiePrefix } from '#utils/prefix.ts';
import mapObject from 'map-obj';

export const ApiCookies_get = () =>
	mapObject(tunnelCookiesData, (cookieName, _cookieProperties) => [
		cookieName,
		{
			name: `${getTunnelCookiePrefix()}${cookieName}`,
		},
	]);
