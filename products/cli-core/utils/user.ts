import type { ActorString } from '@-/actor';
import type { SavedActorData } from '@-/cli-storage';
import type {
	SelectInput,
	SelectOutput,
} from '@-/database';
import { excludeKeys } from 'filter-obj';
import pProps from 'p-props';

import { $try, ok } from 'errok';
import { getWebappTrpc } from './trpc.ts';

export const getUserDataFromSavedActorData = ({
	savedActorData,
}: {
	savedActorData: SavedActorData & { actor: { type: 'User' } };
}) => ($try(async function*() {
	const { webappTrpc } = await getWebappTrpc();
	const actorUserData =
		yield* (await webappTrpc.user.get$organizationMembersData.query({
			actor: savedActorData.actor,
			user: {
				id: savedActorData.actor.data.id,
			},
		})).safeUnwrap();
	return ok(actorUserData);
}));

export async function getUsersDataFromSavedActorsData<
	$Selection extends SelectInput<'User'>,
>({
	savedActorsData,
}: {
	savedActorsData: Record<
		ActorString<'User'>,
		SavedActorData
	>;
}): Promise<
	Record<
		ActorString<'User'>,
		SelectOutput<'User', $Selection>
	>
> {
	const savedActorsUserDataOrNull = await pProps(
		savedActorsData,
		async (savedActorData) =>
			getUserDataFromSavedActorData({
				savedActorData: {
					actor: savedActorData.actor,
					accessToken: savedActorData.accessToken,
					refreshToken: savedActorData.refreshToken,
				},
			}).unwrapOr(null),
	);

	return excludeKeys(
		savedActorsUserDataOrNull,
		(_key, value) => value === null,
	) as Record<
		ActorString<'User'>,
		SelectOutput<'User', $Selection>
	>;
}
