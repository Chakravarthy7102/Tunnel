import { defineSelection } from '@-/database/selection-utils';

export const UserLocalWorkspace_$linkedTunnelInstanceProxyPreviewData =
	defineSelection('UserLocalWorkspace', () => ({
		linkedTunnelInstanceProxyPreview: true,
	}));

export const UserLocalWorkspace_$linkedTunnelInstanceProxyPreviewWithProjectLivePreviewsData =
	defineSelection('UserLocalWorkspace', () => ({
		linkedTunnelInstanceProxyPreview: {
			include: {
				projectLivePreviews: true,
			},
		},
	}));
