import { defineSelection } from '@-/database/selection-utils';

export const OrganizationMember_$tunnelInstancePageToolbarData =
	defineSelection('OrganizationMember', () => ({
		organization: true,
	}));
