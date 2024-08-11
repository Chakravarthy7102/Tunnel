import { type ActorData, parseActorString } from '@-/actor';
import { getCliStorage } from '@-/cli-storage';

export async function getCurrentActorData(): Promise<
	ActorData<'User'> | null
> {
	const cliStorage = getCliStorage();
	const cliStorageData = await cliStorage.get();

	const { currentActorString, savedActorsData } = cliStorageData;
	if (currentActorString === null) {
		return null;
	}

	const currentActorData = {
		accessToken: savedActorsData[currentActorString]
			?.accessToken,
		actor: parseActorString(currentActorString),
	};
	return currentActorData as any;
}
