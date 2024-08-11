import { cliStorageDataSchema } from '#schemas/data.ts';
import type { CliStorageData } from '#types';
import { getDotTunnelDirpathSync } from '@-/dot-tunnel-directory';
import { RELEASE } from '@-/env/app';
import { logger } from '@-/logger';
import onetime from 'onetime';
import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';

const defaultStorageData = {
	currentActorString: null,
	savedActorsData: {},
	currentOrganizationId: null,
	logLevel: {},
} satisfies CliStorageData;

export const getCliStorage = onetime(() => {
	const storage = createStorage<CliStorageData>({
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- broken types
		driver: (fsDriver.default ?? fsDriver)({
			base: getDotTunnelDirpathSync(),
		}),
	});

	return {
		async get(): Promise<CliStorageData> {
			const storageData = await storage.getItem(
				RELEASE === 'production' ?
					'storage.json' :
					`storage.${RELEASE ?? 'development'}.json`,
			);

			const storageDataParseResult = cliStorageDataSchema.safeParse(
				storageData,
			);

			if (!storageDataParseResult.success) {
				if (storageData !== null) {
					logger.debug(
						'Invalid storage data, resetting to default:',
						storageData,
					);
				}

				await storage.setItem(
					RELEASE === 'production' ?
						'storage.json' :
						`storage.${RELEASE ?? 'development'}.json`,
					defaultStorageData,
				);

				return defaultStorageData;
			}

			return storageDataParseResult.data;
		},
		async set(
			data: (oldValue: CliStorageData) => CliStorageData,
		): Promise<void> {
			const storageKey = RELEASE === 'production' ?
				'storage.json' :
				`storage.${RELEASE ?? 'development'}.json`;
			const oldData = await this.get();
			await storage.setItem(storageKey, data(oldData));
		},
	};
});
