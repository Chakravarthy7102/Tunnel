import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	Project_$commentsProviderData,
} from '@-/database/selections';
import deepmerge from 'plaindeepmerge';

/*
	Not nested because we retrieve all the tunnel instance users separately
*/
export const Project_$tunnelInstancePageToolbarData = defineSelection(
	'Project',
	() =>
		deepmerge(
			getInclude(Project_$commentsProviderData),
			{},
		),
);
