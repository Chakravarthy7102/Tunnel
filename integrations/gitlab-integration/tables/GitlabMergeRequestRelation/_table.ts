import { v } from '@-/convex/values';
import { table } from 'corvex';

export const GitlabMergeRequestRelation = table(
	'GitlabMergeRequestRelation',
	v.object({
		project: v.id('Project'),
		gitlabMergeRequest: v.id('GitlabMergeRequest'),
	}),
	(t) =>
		t
			.index('by_project', ['project'])
			.index('by_gitlabMergeRequest', ['gitlabMergeRequest']),
)({
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
	gitlabMergeRequest: {
		foreignTable: 'GitlabMergeRequest',
		hostIndex: 'by_gitlabMergeRequest',
		onDelete: 'Cascade',
	},
});
