import { getHostOfLocalPort } from '#utils/host.ts';
import type { TunnelInstanceConnection } from './_class.ts';

const MAX_CONNECTION_COUNT = 10;

/**
	Exposes a local port by creating a pool of connection pairs that auto-reconnect when any one of them disconnects.
*/
export async function TunnelInstanceConnection_exposeLocalPort(
	this: TunnelInstanceConnection,
	{
		remotePort,
		localPort,
		projectLivePreviewHostname,
		actorUserId,
	}: {
		remotePort: number;
		localPort: number;
		projectLivePreviewHostname: string;
		actorUserId: string;
	},
) {
	// Figure out which host the local port is exposed on
	const localHost = await getHostOfLocalPort({ port: localPort });

	const numExistingConnections =
		this.connectionPairManager.connectionPairMap.get(localPort)?.size ?? 0;
	const connectionsToCreate = MAX_CONNECTION_COUNT - numExistingConnections;

	await Promise.all(
		Array.from({ length: connectionsToCreate }).map(async () => {
			await this.connectionPairManager.createAutoRecreatingConnectionPair({
				actorUserId,
				projectLivePreviewHostname,
				localHost,
				localPort,
				remotePort,
			});
		}),
	);
}
