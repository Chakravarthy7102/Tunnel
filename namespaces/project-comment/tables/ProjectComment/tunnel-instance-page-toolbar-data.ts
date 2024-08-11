import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectComment_$commentsProviderData,
	User_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import deepmerge from 'plaindeepmerge';

/*
	Not nested because we retrieve all the tunnel instance users separately
*/
export const ProjectComment_$tunnelInstancePageToolbarData = defineSelection(
	'ProjectComment',
	() =>
		deepmerge(
			getInclude(ProjectComment_$commentsProviderData),
			{
				authorUser: {
					include: getInclude(User_$tunnelInstancePageToolbarData),
				},
			},
		),
);
