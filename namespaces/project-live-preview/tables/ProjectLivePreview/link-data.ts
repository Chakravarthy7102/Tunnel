import { defineSelection } from '@-/database/selection-utils';

export const ProjectLivePreview_$linkData = defineSelection(
	'ProjectLivePreview',
	() => ({
		linkedProjectCommentThreads: {
			include: {
				resolvedByUser: true,
			},
		},
		project: {
			include: {
				organization: true,
			},
		},
	}),
);
