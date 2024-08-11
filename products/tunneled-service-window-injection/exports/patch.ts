import { patchWindowFetch, patchWindowXmlHttpRequest } from '#utils/fetch.ts';
import { patchConsoleMethods } from '#utils/logs.ts';
import { patchWindowWebsocket } from '#utils/websocket.ts';
import { getHostnameType } from '@-/host-environment';

export function patchGlobals() {
	patchConsoleMethods();
	patchWindowFetch();
	patchWindowXmlHttpRequest();

	const hostnameType = getHostnameType(window.location);
	// We should only patch requests on tunnelapp URLs
	if (hostnameType === 'tunnelapp') {
		patchWindowWebsocket();
	}
}
