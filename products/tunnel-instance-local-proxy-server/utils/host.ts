import { logger } from '@-/logger';
import net from 'node:net';
import { pEvent } from 'p-event';
import pWaitFor from 'p-wait-for';

export async function getHostOfLocalPort({
	port,
	abortController,
}: {
	port: number;
	abortController?: AbortController;
}) {
	const host = await pWaitFor<string>(
		async () => {
			let host: string | undefined;

			for (const possibleHost of ['127.0.0.1', 'localhost']) {
				try {
					// eslint-disable-next-line no-await-in-loop -- We need to check in order
					await new Promise<void>((resolve, reject) => {
						const socket = net.connect({
							port,
							host: possibleHost,
							allowHalfOpen: false,
						});

						socket.write('HEAD /');
						socket.end();

						void pEvent(socket, 'connect', {
							rejectionEvents: [],
						}).then(resolve);

						void pEvent(socket, 'ready', {
							rejectionEvents: [],
						}).then(resolve);

						void pEvent(socket, 'data', {
							rejectionEvents: [],
						}).then(resolve);

						void pEvent(socket, 'close', {
							rejectionEvents: [],
						}).then(reject);

						void pEvent(socket, 'error', {
							rejectionEvents: [],
							filter: (error: Error) => error.message.includes('ECONNREFUSED'),
						}).then(reject);
					});

					host = possibleHost;
					break;
				} catch {
					// localhost failed
				}
			}

			if (host !== undefined) {
				return pWaitFor.resolveWith(host);
			}

			return false;
		},
		{
			timeout: {
				milliseconds: Number.POSITIVE_INFINITY,
				signal: abortController?.signal,
			},
			interval: 2000,
		},
	);

	logger.debug('Connected locally to %s:%d', host, port);

	return host;
}
