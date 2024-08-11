import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/use.ts';
import { useNullablePreloadedQuery } from '#utils/preloaded.ts';
import { createDoc } from '@-/client-doc';
import type { ProjectLivePreview_$tunnelInstancePageToolbarData } from '@-/database/selections';
import { useEffect } from 'react';

export function usePreloadedProjectLivePreview(
	{ context, project }: {
		context: PageToolbarContext;
		project: { _id: string } | null;
	},
) {
	const state = useContextStore(context);
	const projectLivePreview = useNullablePreloadedQuery(
		state.$preloaded.projectLivePreview,
	);
	useEffect(() => {
		if (projectLivePreview === null || project === null) {
			return;
		}

		const createProjectLivePreviewAction = createDoc.action(
			'ProjectLivePreview',
			(create) =>
				create<
					typeof ProjectLivePreview_$tunnelInstancePageToolbarData
				>(
					{
						...projectLivePreview,
						// @ts-expect-error: todo
						project: project._id,
					},
				),
		);

		context.store.setState((state) => {
			state = createProjectLivePreviewAction(state);
			return {
				...state,
				projectLivePreviewId: '_id' in createProjectLivePreviewAction ?
					createProjectLivePreviewAction._id :
					null,
			};
		});
	}, [projectLivePreview]);
}
