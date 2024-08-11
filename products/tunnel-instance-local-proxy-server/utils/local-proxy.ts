import type { getLocalProxy } from '#library/local-proxy.ts';
import type { LocalProxyThis } from '#types';

export function getLocalProxyThis(thisType: LocalProxyThis) {
	return thisType as ReturnType<typeof getLocalProxy>;
}
