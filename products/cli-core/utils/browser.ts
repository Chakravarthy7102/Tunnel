import { logger } from '@-/logger';
import { getReleaseProjectLivePreviewUrl } from '@-/url';
import open from 'open';

export async function openTunnelInBrowser({
	projectLivePreviewUrl,
}: {
	projectLivePreviewUrl: string;
}) {
	const releaseProjectLivePreviewUrl = getReleaseProjectLivePreviewUrl({
		hostname: projectLivePreviewUrl,
		withScheme: true,
	});

	logger.debug(
		'Opening link in browser:',
		releaseProjectLivePreviewUrl,
	);

	await open(releaseProjectLivePreviewUrl);
}
