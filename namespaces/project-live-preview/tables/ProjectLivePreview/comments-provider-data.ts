import { defineSelection } from '@-/database/selection-utils';

export const ProjectLivePreview_$commentsProviderData = defineSelection(
	'ProjectLivePreview',
	() => ({
		project: true,
	}),
);
