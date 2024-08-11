import Debug from 'debug';
import Client from './client.ts';
import TunnelAgent from './tunnel-agent.ts';

// Manage sets of clients
//
// A client is a "user session" established to service a remote localtunnel client
class ClientManager {
	opt: any;
	clients: Map<any, any>;
	stats: {
		tunnels: number;
	};
	debug: Debug.Debugger;
	graceTimeout: NodeJS.Timeout | null;

	constructor(opt: any) {
		this.opt = opt || {};

		// id -> client instance
		this.clients = new Map();

		// statistics
		this.stats = {
			tunnels: 0,
		};

		this.debug = Debug('lt:ClientManager');

		// This is totally wrong :facepalm: this needs to be per-client...
		this.graceTimeout = null;
	}

	// create a new tunnel with `id`
	// if the tunnel could not be created, throws an error
	async newClient(id: string) {
		const { clients, stats } = this;

		const maxSockets = this.opt.max_tcp_sockets;
		const agent = new TunnelAgent({
			clientId: id,
			maxTcpSockets: 10,
		});

		const client = new Client({ id, agent });

		// add to clients map immediately
		// avoiding races with other clients requesting same id
		clients.set(id, client);

		client.once('close', () => {
			this.removeClient(id);
		});

		// try/catch used here to remove client id
		try {
			const info = await agent.listen();
			++stats.tunnels;
			return {
				id,
				port: (info as any).port,
				max_conn_count: maxSockets,
			};
		} catch (error: any) {
			this.removeClient(id);
			// rethrow error for upstream to handle
			throw error;
		}
	}

	removeClient(id: string) {
		this.debug('removing client: %s', id);
		const client = this.clients.get(id);
		if (!client) {
			return;
		}

		this.stats.tunnels -= 1;
		this.clients.delete(id);
		client.close();
	}

	hasClient(id: string) {
		return this.clients.has(id);
	}

	getClient(id: string) {
		return this.clients.get(id);
	}
}

export default ClientManager;
