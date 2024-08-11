import type { ConnectionPairManager } from '#classes/_.ts';
import { createFlatNamespace } from '@tunnel/namespace';
import EventEmitter from 'node:events';
import type net from 'node:net';
import type TypedEventEmitter from 'typesafe-emitter';
import * as methods from './_.methods.ts';

const classMethods = createFlatNamespace('ConnectionPair', methods);

export interface RequestEvent {
	method: string;
	path: string;
	headers: {
		[key: string]: string;
	};
}

/**
	A `ConnectionPair` handles two associated connections:
		- a TCP connection between the local proxy server and the local application
		- a TCP connection between the local proxy server and the tunnel instance live preview server
*/
class ConnectionPairClass {
	private constructor() {
		Object.assign(this, classMethods);
	}

	_emitter = new EventEmitter() as TypedEventEmitter<{
		remoteConnectionOpened(): void;
		remoteConnectionClosed(): void;
		request(event: RequestEvent): void;
		error(error: any): void;
	}>;

	opened = false;
	localConnection: net.Socket | undefined;
	remoteConnection!: net.Socket;
	wasRemoteConnectionRefused = false;
	currentRequest: {
		method: string;
		path: string;
	} | null = null;

	get tunnelInstanceProxyPreview() {
		return this.connectionPairManager.tunnelInstanceProxyPreview;
	}

	connectionPairManager!: ConnectionPairManager;

	static async create({
		connectionPairManager,
		remotePort,
		localPort,
		localHost,
		projectLivePreviewHostname,
	}: {
		connectionPairManager: ConnectionPairManager;
		projectLivePreviewHostname: string;
		remotePort: number;
		localPort: number;
		localHost: string;
	}): Promise<ConnectionPair> {
		const self = new ConnectionPairClass() as ConnectionPair;
		self.connectionPairManager = connectionPairManager;

		self.createRemoteConnection({
			projectLivePreviewHostname,
			remotePort,
			localHost,
			localPort,
		});

		return self;
	}

	on = this._emitter.on.bind(this._emitter);
	off = this._emitter.off.bind(this._emitter);
}

export type ConnectionPair = ConnectionPairClass & typeof classMethods;
export const ConnectionPair = ConnectionPairClass;
