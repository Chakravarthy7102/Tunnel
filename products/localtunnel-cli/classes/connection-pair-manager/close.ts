import type { ConnectionPairManager } from './_class.ts';

export function ConnectionPairManager_closeConnection(
	this: ConnectionPairManager,
	{ port }: { port: number },
) {
	const connectionPairs = this.connectionPairMap.get(port);

	if (connectionPairs === undefined) {
		process.stderr.write(`No connections found for port ${port}\n`);
		return;
	}

	for (const connectionPair of connectionPairs.values()) {
		connectionPair.closeConnection();
	}
}
