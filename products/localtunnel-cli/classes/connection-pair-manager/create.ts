import {
	ConnectionPair,
	type ConnectionPairManager,
	type RequestEvent,
} from '#classes/_.ts';
import { getCliStorage } from '@-/cli-storage';
import { logger } from '@-/logger';
import chalk from 'chalk';
import { pEvent } from 'p-event';

/**
	Creates a pair of TCP/IP socket that connects to the tunnel session server.
*/
export async function ConnectionPairManager_createLocalRemoteConnectionPair(
	this: ConnectionPairManager,
	{
		localPort,
		localHost,
		remotePort,
		projectLivePreviewHostname,
	}: {
		localPort: number;
		localHost: string;
		remotePort: number;
		projectLivePreviewHostname: string;
	},
): Promise<ConnectionPair> {
	const connectionPair = await ConnectionPair.create({
		connectionPairManager: this,
		localHost,
		localPort,
		projectLivePreviewHostname,
		remotePort,
	});

	let portConnectionPairs = this.connectionPairMap.get(localPort);
	if (portConnectionPairs === undefined) {
		portConnectionPairs = new Set();
		this.connectionPairMap.set(localPort, portConnectionPairs);
	}

	portConnectionPairs.add(connectionPair);

	return connectionPair;
}

export async function ConnectionPairManager_createAutoRecreatingConnectionPair(
	this: ConnectionPairManager,
	{
		projectLivePreviewHostname,
		localPort,
		remotePort,
		localHost,
		actorUserId,
	}: {
		projectLivePreviewHostname: string;
		localPort: number;
		remotePort: number;
		localHost: string;
		actorUserId: string;
	},
) {
	const cliStorage = getCliStorage();
	const cliStorageData = await cliStorage.get();

	const connectionPair = await this.createLocalRemoteConnectionPair({
		localHost,
		projectLivePreviewHostname,
		localPort,
		remotePort,
	});

	// for every port, register close listeners so this port can be cleaned up
	// wait for the port to finish connecting to the server. After it connects, execute this callback to attach close listeners (no sense to register close listeners before it connects with the server)

	void pEvent(connectionPair, 'remoteConnectionOpened', {
		rejectionEvents: [],
	}).then(() => {
		logger.debug(
			'remote connection opened for host %s:%d, num available sockets: %d',
			localHost,
			localPort,
			this.connectionPairMap.get(localPort)?.size ?? 0,
			projectLivePreviewHostname,
		);
	});

	// when a connection (one of the 10 open TCP sockets) dies, open a new one
	void pEvent(connectionPair, 'remoteConnectionClosed', {
		rejectionEvents: [],
	}).then(async () => {
		this.connectionPairMap.get(localPort)?.delete(connectionPair);
		logger.debug(
			'Remote connection closed for port %d, num available sockets: %d',
			localPort,
			this.connectionPairMap.get(localPort)?.size ?? 0,
		);

		if (!connectionPair.wasRemoteConnectionRefused) {
			await this.createAutoRecreatingConnectionPair({
				projectLivePreviewHostname,
				localHost,
				remotePort,
				actorUserId,
				localPort,
			});
		}
	});

	connectionPair.on('request', async (event) => {
		const { logLevel } = cliStorageData;
		// eslint-disable-next-line no-restricted-properties -- Cloning an object
		const logLevelOptions = JSON.parse(JSON.stringify(logLevel));

		const methodColors: Record<string, (text: string) => string> = {
			GET: chalk.green,
			POST: chalk.blue,
			PUT: chalk.yellow,
			DELETE: chalk.red,
		};

		const logLevelMappings: Record<
			string,
			Record<string, (event: RequestEvent) => void>
		> = {
			request: {
				noisy(event) {
					const withColor = logLevelOptions.color === 'on';
					const methodColor = methodColors[event.method] ?? chalk.gray;

					process.stdout.write(
						`${
							withColor ? methodColor(event.method) : chalk.bold(event.method)
						} ${event.path}\n`,
					);
				},
				calm(event) {
					if (event.headers['sec-fetch-dest'] === 'document') {
						const withoutColor = logLevelOptions.color === 'off';
						const methodColor = methodColors[event.method] ?? chalk.gray;

						process.stdout.write(
							`${
								withoutColor ?
									chalk.bold(event.method) :
									methodColor(event.method)
							} ${event.path}\n`,
						);
					}
				},
			},
		};

		if (logLevelOptions) {
			for (const key in logLevelOptions) {
				if (
					logLevelMappings[key] &&
					logLevelMappings[key]?.[logLevelOptions[key]]
				) {
					logLevelMappings[key]?.[logLevelOptions[key]]?.(event);
				}
			}
		}
	});

	return connectionPair;
}
