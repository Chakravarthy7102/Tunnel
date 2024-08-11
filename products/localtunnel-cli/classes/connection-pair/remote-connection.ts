import { logger } from '@-/logger';
import convertHrtime from 'convert-hrtime';
import { parseResponse } from 'http-string-parser';
import net from 'node:net';
import invariant from 'tiny-invariant';
import type { ConnectionPair } from './_class.ts';

/**
	If there's an error in our connection to the tunnel session server, we end the connection.
*/
export function ConnectionPair_onRemoteConnectionError(
	this: ConnectionPair,
	{ localPort, error }: { error: Error; localPort: number },
) {
	logger.debug('Remote connection error for port %d', localPort, error);
	this.remoteConnection.end();
}

export function ConnectionPair_onRemoteConnectionData(
	this: ConnectionPair,
	{ data, localHost, localPort }: {
		data: Buffer;
		localHost: string;
		localPort: number;
	},
) {
	if (data.toString().startsWith('__tunnel_error__: ')) {
		this.wasRemoteConnectionRefused = true;
		return;
	}

	if (this.localConnection !== undefined) {
		return;
	}

	this.createLocalConnection({
		localHost,
		localPort,
	});
	this.remoteConnection.unshift(data);

	const dataString = data.toString();

	/**
		Whenever we receive data from the remote connection that contains a "<method> <path>", we emit these request events to be logged to the console.
	*/
	const match = dataString.match(/^(\w+) (\S+)/);

	if (match) {
		invariant(match[1] !== undefined, 'match[1]');
		invariant(match[2] !== undefined, 'match[2]');

		const method = match[1];
		const path = match[2];

		// eslint-disable-next-line no-restricted-properties -- Cloning an object
		const headers = JSON.parse(
			JSON.stringify(parseResponse(dataString).headers),
		);

		logger.debug(
			`[${method} ${path}] Received data from server @ ${
				convertHrtime(process.hrtime.bigint()).milliseconds
			}`,
		);

		this.currentRequest = {
			method,
			path,
		};
		this._emitter.emit('request', {
			method,
			path,
			headers,
		});
	}
}

export function ConnectionPair_onRemoteConnectionClose(
	this: ConnectionPair,
	_hadError: boolean,
) {
	this.localConnection?.end();
	this._emitter.emit('remoteConnectionClosed');
}

/**
	The way we authenticate with the Tunnel Session server is through a "secret" which is provided when a tunnel session is created through the Next.js Tunnel server.

	When we've established a connection to the tunnel session server, we send an identification message to the server so it can identify & authenticate our socket. In addition, this token also allows the Tunnel Session Server to get data about our session using the database.
*/
export async function ConnectionPair_onRemoteConnectionConnect(
	this: ConnectionPair,
) {
	this._emitter.emit('remoteConnectionOpened');
}

export function ConnectionPair_createRemoteConnection(
	this: ConnectionPair,
	{
		projectLivePreviewHostname,
		remotePort,
		localPort,
		localHost,
	}: {
		projectLivePreviewHostname: string;
		remotePort: number;
		localPort: number;
		localHost: string;
	},
): void {
	// Creates a TCP connection to the tunnel server
	this.remoteConnection = net.createConnection({
		host: projectLivePreviewHostname,
		port: remotePort,
		/**
			We deliberately don't allow half-open TCP connections to the remote connection because it is up to the server to close the connection based on when it thinks it's received the entire response.

			However, this only works for HTTP requests, where you can use the `Content-Length` header to calculate the end of the response, and might not work with other protocols. In the future, we should set this value to `true` but take into account the server ending the request first.
		*/
		allowHalfOpen: false,
		keepAlive: true,
	});

	this.remoteConnection.on(
		'connect',
		() => {
			void this.onRemoteConnectionConnect();
		},
	);
	this.remoteConnection.on('error', (error) => {
		this.onRemoteConnectionError({ error, localPort });
	});
	this.remoteConnection.on('data', (data) => {
		this.onRemoteConnectionData({ data, localHost, localPort });
	});
	this.remoteConnection.once('close', (hadError) => {
		this.onRemoteConnectionClose(hadError);
	});
}
