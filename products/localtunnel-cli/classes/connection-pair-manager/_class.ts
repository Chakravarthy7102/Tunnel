import type { ConnectionPair, TunnelInstanceConnection } from '#classes/_.ts';
import { createFlatNamespace } from '@tunnel/namespace';
import * as methods from './_.methods.ts';

const classMethods = createFlatNamespace('ConnectionPairManager', methods);

/**
	Handles a pool of connection pairs.
*/
class ConnectionPairManagerClass {
	private constructor() {
		Object.assign(this, classMethods);
	}

	/**
		Map from port number to ConnectionPair`
	*/
	connectionPairMap = new Map<number, Set<ConnectionPair>>();
	tunnelInstanceConnection!: TunnelInstanceConnection;

	get tunnelInstanceProxyPreview() {
		return this.tunnelInstanceConnection.tunnelInstanceProxyPreview;
	}

	static async create({
		tunnelInstanceConnection,
	}: {
		tunnelInstanceConnection: TunnelInstanceConnection;
	}): Promise<ConnectionPairManager> {
		const self = new ConnectionPairManager() as ConnectionPairManager;
		self.tunnelInstanceConnection = tunnelInstanceConnection;

		return self;
	}
}

export type ConnectionPairManager =
	& ConnectionPairManagerClass
	& typeof classMethods;
export const ConnectionPairManager = ConnectionPairManagerClass;
