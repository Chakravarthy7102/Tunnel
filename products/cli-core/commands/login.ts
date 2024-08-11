import { loginWithBrowser } from '#utils/login.ts';
import { getCliStorage } from '@-/cli-storage';
import { $try, ok } from 'errok';
import { excludeKeys } from 'filter-obj';

export const runLoginCommand = (
	_args: { argv: string[] },
) => ($try(async function*() {
	// We need to clear existing login data
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

	yield* loginWithBrowser().safeUnwrap();
	return ok(0);
}));
