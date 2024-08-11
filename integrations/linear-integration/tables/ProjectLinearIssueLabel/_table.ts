import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const ProjectLinearIssueLabel = table(
	'ProjectLinearIssueLabel',
	v.object({
		projectLinearIssue: v.id('ProjectLinearIssue'),
		organization: v.id('Organization'),
		labelId: v.string(),
		name: v.string(),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organization', ['organization'])
			.index('by_labelId', ['labelId'])
			.index('by_projectLinearIssue', ['projectLinearIssue']),
)({
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	projectLinearIssue: {
		foreignTable: 'ProjectLinearIssue',
		hostIndex: 'by_projectLinearIssue',
		onDelete: 'Cascade',
	},
});
