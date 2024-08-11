import { ConnectionPairManager } from '#classes/_.ts';
import type { Id } from '@-/database';
import { createFlatNamespace } from '@tunnel/namespace';
import { EventEmitter } from 'node:events';
import type TypedEventEmitter from 'typesafe-emitter';
import * as methods from './_.methods.ts';

const classMethods = createFlatNamespace('TunnelInstanceConnection', methods);

/**
	Manages a connection to a tunnel instance live preview.
*/
class TunnelInstanceConnectionClass {
	private constructor() {
		Object.assign(this, classMethods);
	}

	openPorts: number[] = [];
	closed = false;
	_emitter = new EventEmitter() as TypedEventEmitter<{
		tunnelClosed(): void;
		websocketConnected(): void;
	}>;

	static instances = {
		byTunnelInstanceProxyPreviewId: new Map<
			string,
			TunnelInstanceConnection
		>(),
	};

	tunnelInstanceProxyPreview!: { id: string };
	connectionPairManager!: ConnectionPairManager;

	static async getOrCreate({
		tunnelInstanceProxyPreviewId,
	}: {
		tunnelInstanceProxyPreviewId: Id<'TunnelInstanceProxyPreview'>;
	}): Promise<TunnelInstanceConnection> {
		const existingSelf = TunnelInstanceConnection.instances
			.byTunnelInstanceProxyPreviewId.get(
				tunnelInstanceProxyPreviewId,
			);

		if (existingSelf !== undefined) {
			return existingSelf;
		}

		const self = new TunnelInstanceConnection() as TunnelInstanceConnection;

		// Make sure this is set before the `await`
		TunnelInstanceConnection.instances.byTunnelInstanceProxyPreviewId.set(
			tunnelInstanceProxyPreviewId,
			self,
		);

		self.connectionPairManager = await ConnectionPairManager.create({
			tunnelInstanceConnection: self,
		});
		self.tunnelInstanceProxyPreview = { id: tunnelInstanceProxyPreviewId };

		return self;
	}

	static async get(selector: { id: string } | { slug: string }) {
		if ('id' in selector) {
			return TunnelInstanceConnection.instances.byTunnelInstanceProxyPreviewId
				.get(selector.id);
		}
	}

	on = this._emitter.on.bind(this._emitter);
	off = this._emitter.off.bind(this._emitter);
}

export type TunnelInstanceConnection =
	& TunnelInstanceConnectionClass
	& typeof classMethods;
export const TunnelInstanceConnection = TunnelInstanceConnectionClass;
