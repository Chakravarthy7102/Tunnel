import { defineSelection, getInclude } from '@-/database/selection-utils';
import {
	ProjectCommentThread_$webhookData,
	User_$webhookData,
} from '@-/database/selections';

export const ProjectComment_$webhookData = defineSelection(
	'ProjectComment',
	() => ({
		authorUser: {
			include: getInclude(User_$webhookData),
		},
		parentCommentThread: {
			include: getInclude(ProjectCommentThread_$webhookData),
		},
	}),
);
