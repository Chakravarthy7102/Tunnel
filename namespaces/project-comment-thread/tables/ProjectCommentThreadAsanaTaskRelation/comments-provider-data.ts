import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectAsanaTask_$all,
} from '@-/database/selections';

export const ProjectCommentThreadAsanaTaskRelation_$commentsProviderData =
	defineSelection('ProjectCommentThreadAsanaTaskRelation', () => ({
		projectAsanaTask: {
			include: getInclude(ProjectAsanaTask_$all),
		},
	}));
