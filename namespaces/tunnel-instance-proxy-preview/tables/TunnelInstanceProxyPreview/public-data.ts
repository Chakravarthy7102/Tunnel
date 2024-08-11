import { defineSelection } from '@-/database/selection-utils';

export const TunnelInstanceProxyPreview_$publicData = defineSelection(
	'TunnelInstanceProxyPreview',
	() => ({
		createdByUser: true,
	}),
);
