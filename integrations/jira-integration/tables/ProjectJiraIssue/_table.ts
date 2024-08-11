import {
	jiraAssigneeValidator,
	jiraIssueTypeValidator,
	jiraParentIssueValidator,
	jiraProjectValidator,
} from '#validators/jira.ts';
import { v } from '@-/convex/values';
import type * as $ from '@-/database/tables';
import {
	table,
	vDeprecated,
	virtualArray,
	vNew,
	vNullable,
	vVirtualArray,
} from 'corvex';

export const ProjectJiraIssue = table(
	'ProjectLinearIssue',
	v.object({
		project: v.id('Project'),
		organization: v.id('Organization'),
		// Jira Issue data
		issueId: v.string(),
		key: v.string(),
		self: v.string(),
		url: v.string(),
		jiraProject: vNew(vNullable(jiraProjectValidator)),
		assignee: vNew(vNullable(jiraAssigneeValidator)),
		issueType: vNew(vNullable(jiraIssueTypeValidator)),
		parentIssue: vNew(vNullable(jiraParentIssueValidator)),
		labels: vVirtualArray('ProjectJiraIssueLabel'),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_project', ['project'])
			.index('by_organization', ['organization'])
			.index('by_assigneeAccountId', ['assignee.accountId'])
			.index('by_key', ['key'])
			.index('by_issueId', ['issueId'])
			.index('by_issueTypeId', ['issueType.id'])
			.index('by_jiraProjectId', ['jiraProject.id']),
)({
	assignee: { default: () => null },
	issueType: { default: () => null },
	parentIssue: { default: () => null },
	jiraProject: { default: () => null },
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	labels: virtualArray<typeof $.ProjectJiraIssueLabel>(
		'ProjectJiraIssueLabel',
		'by_projectJiraIssue',
	),
});
