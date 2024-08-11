import { tunnelInstancePageSecretStorageDataSchema } from '#schemas/data.ts';
import type { TunnelInstancePageSecretStorageData } from '#types';
import { RELEASE } from '@-/env/app';
import { logger } from '@-/logger';
import destr from 'destru';
import onetime from 'onetime';
import { createStorage } from 'unstorage';
import localstorageDriver from 'unstorage/drivers/localstorage';

const defaultTunnelInstancePageSecretStorageData:
	TunnelInstancePageSecretStorageData = {
		actorUserId: null,
		accessToken: null,
		refreshToken: null,
	};

export const getTunnelInstancePageSecretStorage = onetime(() => {
	const storage = createStorage<TunnelInstancePageSecretStorageData>({
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- broken types
		driver: (localstorageDriver.default ?? localstorageDriver)({
			base: 'tunnel',
		}),
	});

	const storageName = RELEASE ?? 'development';

	return {
		watch: storage.watch.bind(storage),
		unwatch: storage.unwatch.bind(storage),
		async get(): Promise<TunnelInstancePageSecretStorageData> {
			let storageData = await storage.getItem(storageName);
			const storageDataParseResult = tunnelInstancePageSecretStorageDataSchema
				.safeParse(storageData);
			if (storageDataParseResult.success) {
				storageData = storageDataParseResult.data;
			} else {
				if (storageData !== null) {
					logger.error(
						'Invalid storage data:',
						storageDataParseResult.error,
						'resetting to defaults',
					);
				}

				storageData = defaultTunnelInstancePageSecretStorageData;
				await storage.setItem(
					storageName,
					defaultTunnelInstancePageSecretStorageData,
				);
			}

			return storageData;
		},
		async set(
			data:
				| TunnelInstancePageSecretStorageData
				| ((
					oldData: TunnelInstancePageSecretStorageData,
				) => TunnelInstancePageSecretStorageData),
		) {
			if (typeof data === 'function') {
				await storage.setItem(storageName, data(await this.get()));
			} else {
				await storage.setItem(storageName, data);
			}
		},
		getSync(): TunnelInstancePageSecretStorageData {
			const stringifiedData = localStorage.getItem(`tunnel:${storageName}`);
			let data: TunnelInstancePageSecretStorageData;
			if (stringifiedData === null) {
				data = defaultTunnelInstancePageSecretStorageData;
			} else {
				const tunnelInstancePageSecretStorageDataParseResult =
					tunnelInstancePageSecretStorageDataSchema.safeParse(
						destr(stringifiedData),
					);

				if (tunnelInstancePageSecretStorageDataParseResult.success) {
					data = tunnelInstancePageSecretStorageDataParseResult.data;
				} else {
					data = defaultTunnelInstancePageSecretStorageData;
					localStorage.setItem(
						`tunnel:${storageName}`,
						JSON.stringify(defaultTunnelInstancePageSecretStorageData),
					);
				}
			}

			return data;
		},
		setSync(
			data:
				| TunnelInstancePageSecretStorageData
				| ((
					oldData: TunnelInstancePageSecretStorageData,
				) => TunnelInstancePageSecretStorageData),
		) {
			if (typeof data === 'function') {
				localStorage.setItem(
					`tunnel:${storageName}`,
					JSON.stringify(data(this.getSync())),
				);
			} else {
				localStorage.setItem(`tunnel:${storageName}`, JSON.stringify(data));
			}
		},
	};
});
