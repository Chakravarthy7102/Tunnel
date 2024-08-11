import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/use.ts';
import { useNullablePreloadedQuery } from '#utils/preloaded.ts';
import { createDoc } from '@-/client-doc';
import type { EmptySelection } from '@-/database';
import { useEffect } from 'react';

export function usePreloadedActorOrganizationMember({ context }: {
	context: PageToolbarContext;
}) {
	const state = useContextStore(context);
	const actorOrganizationMember = useNullablePreloadedQuery(
		state.$preloaded.actorOrganizationMember,
	);

	useEffect(() => {
		if (actorOrganizationMember === null) {
			return;
		}

		const createActorOrganizationMemberAction = createDoc.action(
			'OrganizationMember',
			(create) =>
				create<EmptySelection<'OrganizationMember'>>(
					actorOrganizationMember,
				),
		);

		context.store.setState((state) => {
			state = createActorOrganizationMemberAction(state);
			return {
				...state,
				actorOrganizationMemberId: createActorOrganizationMemberAction._id,
			};
		});
	}, [actorOrganizationMember]);
}
