import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/use.ts';
import { useNullablePreloadedQuery } from '#utils/preloaded.ts';
import { createDoc } from '@-/client-doc';
import type {
	TunnelInstanceProxyPreview_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import { useEffect } from 'react';

export function usePreloadedTunnelInstanceProxyPreview(
	{ context, project }: {
		context: PageToolbarContext;
		project: { _id: string } | null;
	},
) {
	const state = useContextStore(context);
	const tunnelInstanceProxyPreview = useNullablePreloadedQuery(
		state.$preloaded.tunnelInstanceProxyPreview,
	);

	useEffect(() => {
		if (tunnelInstanceProxyPreview === null || project === null) {
			return;
		}

		const createTunnelInstanceProxyPreviewAction = createDoc.action(
			'TunnelInstanceProxyPreview',
			(create) =>
				create<
					typeof TunnelInstanceProxyPreview_$tunnelInstancePageToolbarData
				>(
					{
						...tunnelInstanceProxyPreview,
						// @ts-expect-error: todo
						project: project._id,
					},
				),
		);

		context.store.setState((state) => {
			state = createTunnelInstanceProxyPreviewAction(state);
			return {
				...state,
				tunnelInstanceProxyPreviewId:
					'_id' in createTunnelInstanceProxyPreviewAction ?
						createTunnelInstanceProxyPreviewAction._id :
						null,
			};
		});
	}, [tunnelInstanceProxyPreview]);
}
