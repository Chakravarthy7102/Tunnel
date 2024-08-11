import { v } from '@-/convex/values';
import { table } from 'corvex';

export const GitlabMergeRequest = table(
	'GitlabMergeRequest',
	v.object({
		authorOrganizationMember: v.id('OrganizationMember'),
		sourceBranch: v.string(),
		latestCommitSha: v.string(),
		mergeRequestId: v.number(),
		mergeRequestIid: v.number(),
		projectId: v.number(),
		isOpen: v.boolean(),
		noteId: v.number(),
	}),
	(t) =>
		t
			.index('by_mergeRequestId', ['mergeRequestId'])
			.index('by_projectId', ['projectId'])
			.index('by_authorOrganizationMember', ['authorOrganizationMember'])
			.index('by_noteId', ['noteId']),
)({
	authorOrganizationMember: {
		foreignTable: 'OrganizationMember',
		hostIndex: 'by_authorOrganizationMember',
		onDelete: 'Cascade',
	},
});
