import { defineSelection } from '@-/database/selection-utils';

export const Project_$commentsProviderData = defineSelection('Project', () => ({
	organization: true,
}));
