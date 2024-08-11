import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/use.ts';
import { useNullablePreloadedQuery } from '#utils/preloaded.ts';
import { createDoc } from '@-/client-doc';
import type { User_$profileData } from '@-/database/selections';
import { useEffect } from 'react';

export function usePreloadedActorUser({ context }: {
	context: PageToolbarContext;
}) {
	const state = useContextStore(context);
	const actorUser = useNullablePreloadedQuery(state.$preloaded.actorUser);

	useEffect(() => {
		if (actorUser === null) {
			return;
		}

		const createActorUserAction = createDoc.action(
			'User',
			(create) => create<typeof User_$profileData>(actorUser),
		);

		context.store.setState((state) => {
			state = createActorUserAction(state);
			return {
				...state,
				actorUserId: createActorUserAction._id,
			};
		});
	}, [actorUser]);
}
