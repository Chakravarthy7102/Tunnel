import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectComment_$commentsProviderData,
} from '@-/database/selections';
import deepmerge from 'plaindeepmerge';

export const ProjectComment_$dashboardPageData = defineSelection(
	'ProjectComment',
	() =>
		deepmerge(
			getInclude(ProjectComment_$commentsProviderData),
			{
				parentCommentThread: true,
				authorUser: true,
				files: true,
			},
		),
);
