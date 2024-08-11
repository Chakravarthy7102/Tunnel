import { defineSelection } from '@-/database/selection-utils';

export const GitlabMergeRequestRelation_$gitlabMergeRequestData =
	defineSelection(
		'GitlabMergeRequestRelation',
		() => ({
			gitlabMergeRequest: {
				include: {
					authorOrganizationMember: true,
				},
			},
		}),
	);
