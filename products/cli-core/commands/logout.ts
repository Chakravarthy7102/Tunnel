import { getCliStorage } from '@-/cli-storage';
import { logger } from '@-/logger';
import { ok, ResultAsync } from 'errok';
import { excludeKeys } from 'filter-obj';

export function runLogoutCommand() {
	return ResultAsync.fromFunction(async () => {
		const cliStorage = getCliStorage();
		const cliStorageData = await cliStorage.get();
		if (cliStorageData.currentActorString !== null) {
			await cliStorage.set((data) => ({
				...data,
				currentActorString: null,
				savedActorsData: excludeKeys(
					cliStorageData.savedActorsData,
					[cliStorageData.currentActorString as string],
				) as any,
			}));
		}

		logger.info('Successfully logged out');
		return ok(0);
	});
}
