/**
	This route is for supporting tRPC subscriptions from tRPC clients connecting to the instrumentation API.

	Under the hood, it just proxies all requests between the tRPC client and the instrumentation API servers.
*/
export function WS() {
	throw new Error('Not implemented');

	// const { port: portString } = request.params as { port: string };
	// const port = Number(portString);
	// if (Number.isNaN(port)) {
	// 	trpcClientConnection.write('Invalid port');
	// 	trpcClientConnection.destroy();
	// 	return;
	// }

	// const nodeLoaderTrpcConnection = NodeLoaderTrpcConnection.getOrCreate({
	// 	port,
	// 	context
	// });

	// // Forward all outgoing messages to the node loader tRPC connection
	// trpcClientConnection.socket.on('message', async (data) => {
	// 	await nodeLoaderTrpcConnection.sendData(data);
	// });

	// // Forward all incoming messages from the node loader tRPC connection
	// for (const incomingEmitter of Object.values(
	// 	nodeLoaderTrpcConnection.incomingEmitters
	// )) {
	// 	incomingEmitter.onAny((eventName, eventData) => {
	// 		trpcClientConnection.socket.send(eventData);
	// 	});
	// }
}
