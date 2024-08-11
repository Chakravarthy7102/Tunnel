export function getSetGlobalTunneledServiceEnvironmentDataJavascriptUrl({
	hostUrl,
}: {
	hostUrl: globalThis.URL;
}): string {
	// This request should always be handled by the local proxy server
	return `${hostUrl.origin}/__tunnel/set-global-tunneled-service-environment-data.js`;
}
