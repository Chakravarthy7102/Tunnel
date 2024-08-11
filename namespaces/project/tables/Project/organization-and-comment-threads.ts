import { defineSelection } from '@-/database/selection-utils';

export const Project_$organizationAndCommentThreads = defineSelection(
	'Project',
	() => ({
		organization: true,
		commentThreads: {
			include: {
				gitMetadata_: true,
				resolvedByUser: true,
			},
		},
	}),
);
