import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectComment_$dashboardPageData,
	ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import deepmerge from 'plaindeepmerge';

export const ProjectCommentThread_$dashboardPageData = defineSelection(
	'ProjectCommentThread',
	() =>
		deepmerge(
			getInclude(ProjectCommentThread_$commentsProviderData),
			{
				resolvedByUser: true,
				comments: {
					include: getInclude(ProjectComment_$dashboardPageData),
				},
			},
		),
);
