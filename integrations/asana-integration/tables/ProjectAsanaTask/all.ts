import { defineSelection } from '@-/database/selection-utils';

export const ProjectAsanaTask_$all = defineSelection(
	'ProjectAsanaTask',
	() => ({
		tags: true,
	}),
);
