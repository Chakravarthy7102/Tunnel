import { defineSelection } from '@-/database/selection-utils';

export const TunnelInstanceProxyPreview_$commentsProviderData = defineSelection(
	'TunnelInstanceProxyPreview',
	() => ({
		project: true,
	}),
);
