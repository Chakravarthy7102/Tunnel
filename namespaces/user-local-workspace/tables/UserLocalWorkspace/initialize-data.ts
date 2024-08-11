import { defineSelection } from '@-/database/selection-utils';

export const UserLocalWorkspace_$initializeData = defineSelection(
	'UserLocalWorkspace',
	() => ({
		project: {
			include: {
				organization: true,
			},
		},
		linkedTunnelInstanceProxyPreview: true,
	}),
);

export const UserLocalWorkspace_$userData = defineSelection(
	'UserLocalWorkspace',
	() => ({
		user: true,
	}),
);
