import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/use.ts';
import { useNullablePreloadedQuery } from '#utils/preloaded.ts';
import { createDoc } from '@-/client-doc';
import type { Project_$tunnelInstancePageToolbarData } from '@-/database/selections';
import { useEffect } from 'react';

export function usePreloadedProject({ context }: {
	context: PageToolbarContext;
}) {
	const state = useContextStore(context);
	const project = useNullablePreloadedQuery(state.$preloaded.project);

	useEffect(() => {
		if (project === null) {
			return;
		}

		const createProjectAction = createDoc.action(
			'Project',
			(create) =>
				create<typeof Project_$tunnelInstancePageToolbarData>(
					project,
				),
		);

		context.store.setState((state) => {
			state = createProjectAction(state);
			return {
				...state,
				projectId: createProjectAction._id,
			};
		});
	}, [project]);

	return project;
}
