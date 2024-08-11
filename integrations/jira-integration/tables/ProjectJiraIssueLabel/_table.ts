import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const ProjectJiraIssueLabel = table(
	'ProjectJiraIssueLabel',
	v.object({
		projectJiraIssue: v.id('ProjectJiraIssue'),
		organization: v.id('Organization'),
		name: v.string(),

		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organization', ['organization'])
			.index('by_name', ['name'])
			.index('by_projectJiraIssue', ['projectJiraIssue']),
)({
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	projectJiraIssue: {
		foreignTable: 'ProjectJiraIssue',
		hostIndex: 'by_projectJiraIssue',
		onDelete: 'Cascade',
	},
});
