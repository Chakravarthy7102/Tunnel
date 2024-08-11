import { TunnelInstanceConnection } from '#classes/tunnel-instance-connection/_class.ts';
import type { Id } from '@-/database';

export default async function localtunnel(
	{
		localPort,
		remotePort,
		actorUserId,
		projectLivePreviewHostname,
		tunnelInstanceProxyPreviewId,
	}: {
		tunnelInstanceProxyPreviewId: Id<'TunnelInstanceProxyPreview'>;
		actorUserId: string;
		localPort: number;
		remotePort: number;
		projectLivePreviewHostname: string;
	},
) {
	const connection = await TunnelInstanceConnection.getOrCreate({
		tunnelInstanceProxyPreviewId,
	});
	await connection.exposeLocalPort({
		actorUserId,
		localPort,
		remotePort,
		projectLivePreviewHostname,
	});
}
