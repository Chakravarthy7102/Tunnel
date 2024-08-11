import { defineSelection } from '@-/database/selection-utils';

export const TunnelInstanceProxyPreview_$tunnelInstancePageToolbarData =
	defineSelection('TunnelInstanceProxyPreview', () => (
		{
			project: {
				include: {
					organization: true,
				},
			},
		}
	));
