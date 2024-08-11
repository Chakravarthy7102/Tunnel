import { logger } from '@-/logger';
import convertHrtime from 'convert-hrtime';
import net from 'node:net';
import invariant from 'tiny-invariant';
import type { ConnectionPair } from './_class.ts';

export function ConnectionPair_createLocalConnection(
	this: ConnectionPair,
	{
		localHost,
		localPort,
	}: {
		localHost: string;
		localPort: number;
	},
): void {
	if (this.remoteConnection.destroyed) {
		this._emitter.emit('remoteConnectionClosed');
		return;
	}

	this.remoteConnection.pause();

	this.localConnection = net.connect({
		host: localHost,
		port: localPort,

		/**
			We deliberately don't allow half-open TCP connections here because the
			local application might not support half-open connections.
		*/
		allowHalfOpen: false,
	});

	// once is an on that calls the callback once
	this.localConnection.once('error', this.onceLocalConnectionError.bind(this));
	this.localConnection.once(
		'connect',
		this.onceLocalConnectionConnect.bind(this),
	);
}

export function ConnectionPair_closeConnection(this: ConnectionPair) {
	this.localConnection?.end();
	this.remoteConnection.removeListener(
		'close',
		this.onRemoteConnectionClose.bind(this),
	);

	return this.remoteConnection.end();
}

export function onceLocalConnectionError(
	this: ConnectionPair,
	error: Error & { code?: string },
) {
	logger.debug('local connection error:', error);
	this.localConnection?.end();
	this.remoteConnection.removeListener(
		'close',
		this.onRemoteConnectionClose.bind(this),
	);

	if (error.code !== 'ECONNREFUSED' && error.code !== 'ECONNRESET') {
		return this.remoteConnection.end();
	}
}

/**
	Callback when the localConnection socket connects with the local server
*/
export async function onceLocalConnectionConnect(this: ConnectionPair) {
	this.remoteConnection.resume();

	const remoteStream = this.remoteConnection;

	invariant(this.localConnection, 'localConnection has been created by now');

	this.localConnection.pause();

	// Here, `remoteStream` (a.k.a. `remoteConnection`) is a Readable containing the HTTP request data from the server
	remoteStream
		// As data arrives from the remote stream, we send that data to the local application. Note that the FIN packet is never sent from the remote stream for HTTP requests, and that the server will be responsible for closing the socket connection when it determines that the HTTP response is complete.
		.pipe(this.localConnection);

	const { currentRequest } = this;
	invariant(currentRequest !== null, 'currentRequest should not be null');

	let receivedData = false;
	this.localConnection.on('data', (chunk) => {
		if (!receivedData) {
			logger.debug(
				`[${currentRequest.method} ${currentRequest.path}] Received data from local connection @ ${
					convertHrtime(process.hrtime.bigint()).milliseconds
				}`,
			);

			receivedData = true;
		}

		this.remoteConnection.write(chunk);
	});

	this.localConnection.on('end', () => {
		logger.debug(
			`[${currentRequest.method} ${currentRequest.path}] Ended remote connection @ ${
				convertHrtime(process.hrtime.bigint()).milliseconds
			}`,
		);
		this.remoteConnection.end();
	});

	this.localConnection.resume();
}
