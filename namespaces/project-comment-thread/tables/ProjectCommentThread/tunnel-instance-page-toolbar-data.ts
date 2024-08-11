import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectComment_$tunnelInstancePageToolbarData,
	ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import deepmerge from 'plaindeepmerge';

export const ProjectCommentThread_$tunnelInstancePageToolbarData =
	defineSelection('ProjectCommentThread', () =>
		deepmerge(
			getInclude(ProjectCommentThread_$commentsProviderData),
			{
				resolvedByUser: true,
				comments: {
					include: getInclude(ProjectComment_$tunnelInstancePageToolbarData),
				},
			},
		));
