import { defineSelection } from '@-/database/selection-utils';

export const TunnelInstanceProxyPreview_$projectLivePreviewsData =
	defineSelection(
		'TunnelInstanceProxyPreview',
		() => ({
			projectLivePreviews: true,
		}),
	);
