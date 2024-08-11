import { defineSelection } from '@-/database/selection-utils';

export const ProjectLivePreview_$projectData = defineSelection(
	'ProjectLivePreview',
	() => ({ project: true }),
);
