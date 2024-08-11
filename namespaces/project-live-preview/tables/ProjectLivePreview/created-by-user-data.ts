import { defineSelection } from '@-/database/selection-utils';

export const ProjectLivePreview_$createdByUserData = defineSelection(
	'ProjectLivePreview',
	() => ({
		createdByUser: true,
	}),
);
