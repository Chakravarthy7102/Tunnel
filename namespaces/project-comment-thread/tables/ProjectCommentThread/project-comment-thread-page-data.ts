import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectCommentThread_$commentsProviderData,
} from '@-/database/selections';
import deepmerge from 'plaindeepmerge';

export const ProjectCommentThread_$projectCommentThreadPageData =
	defineSelection(
		'ProjectCommentThread',
		() =>
			deepmerge(
				getInclude(ProjectCommentThread_$commentsProviderData),
				{
					project: {
						include: {
							organization: true,
						},
					},
				},
			),
	);
