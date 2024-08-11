import { defineSelection } from '@-/database/selection-utils';

export const TunnelInstanceProxyPreview_$linkData = defineSelection(
	'TunnelInstanceProxyPreview',
	() => ({
		project: {
			include: {
				organization: true,
			},
		},
	}),
);
