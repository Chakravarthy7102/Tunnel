import type { LocalProxyContext, LocalProxyThis } from '#types';
import { getWebappTrpc } from '#utils/trpc.ts';
import type { Actor } from '@-/actor';
import type { Id } from '@-/database';
import { APP_ENV } from '@-/env/app';
import localtunnel from '@-/localtunnel-cli';
import { logger } from '@-/logger';
import { getReleaseProjectLivePreviewUrl } from '@-/url';
import { ApiUrl } from '@-/url/api';

export async function TunnelInstanceProxyPreview_connect(
	this: LocalProxyThis,
	{
		actor,
		tunnelInstanceProxyPreviewId,
	}: {
		context: LocalProxyContext;
		actor: Actor<'User'>;
		tunnelInstanceProxyPreviewId: Id<'TunnelInstanceProxyPreview'>;
	},
) {
	const { webappTrpc } = await getWebappTrpc({ actor });

	logger.debug('Creating tunnel instance live preview connection...');
	const tunnelInstanceProxyPreview =
		(await webappTrpc.tunnelInstanceProxyPreview.get$projectLivePreviewsData
			.query({
				actor,
				tunnelInstanceProxyPreview: {
					id: tunnelInstanceProxyPreviewId,
				},
			})).unwrapOrThrow();

	if (tunnelInstanceProxyPreview === null) {
		throw new Error('Tunnel instance proxy preview not found');
	}

	const projectLivePreviewUrl = tunnelInstanceProxyPreview
		.projectLivePreviews[0]?.url;
	if (projectLivePreviewUrl === undefined) {
		throw new Error(
			"Tunnel Instance Proxy Preview doesn't have any live previews",
		);
	}

	const projectLivePreviewHostname = getReleaseProjectLivePreviewUrl({
		hostname: projectLivePreviewUrl,
		withScheme: false,
	});
	const subdomain = projectLivePreviewHostname.split('.')[0];
	const response = await fetch(
		ApiUrl.getTunnelappUrl({
			withScheme: true,
			path: subdomain,
			// We don't have `staging.tunnelapp.dev` yet
			release: APP_ENV === 'development' ? null : 'production',
		}),
	);
	const json = await response.json();
	const { port } = json;

	await localtunnel({
		actorUserId: actor.data.id,
		localPort: tunnelInstanceProxyPreview.localTunnelProxyServerPortNumber,
		remotePort: port,
		projectLivePreviewHostname,
		tunnelInstanceProxyPreviewId,
	});
	logger.debug('Created tunnel instance live preview connection!');
}
