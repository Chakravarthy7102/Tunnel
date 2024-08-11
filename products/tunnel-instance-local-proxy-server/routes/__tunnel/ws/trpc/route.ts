import type { RouteThis } from '#types';
import { localProxyApiRouter } from '#utils/api.ts';
import { applyWSSHandler } from '@trpc/server/adapters/ws';

export function WS(this: RouteThis) {
	applyWSSHandler({
		router: localProxyApiRouter,
		wss: this.fastifyServer.websocketServer,
		createContext: () => ({
			context: this.context,
		}),
	});
}
