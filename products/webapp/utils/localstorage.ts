import type { Actor } from '@-/actor';
import { RELEASE } from '@-/env/app';
import onetime from 'onetime';
import { createStorage } from 'unstorage';
import localstorageDriver from 'unstorage/drivers/localstorage';

interface LocalstorageStorageData {
	actor: Actor<'User'>;
}

export const getLocalstorageStorage = onetime(() => {
	const storage = createStorage<LocalstorageStorageData>({
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- broken types
		driver: (localstorageDriver.default ?? localstorageDriver)({
			base: 'tunnel',
		}),
	});

	return {
		async get() {
			return storage.getItem(RELEASE ?? 'development');
		},
		async set(value: LocalstorageStorageData) {
			await storage.setItem(RELEASE ?? 'development', value);
		},
	};
});
