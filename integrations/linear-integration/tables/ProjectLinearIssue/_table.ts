import {
	linearAssigneeValidator,
	linearPriorityValidator,
	linearProjectValidator,
	linearStatusValidator,
	linearTeamValidator,
} from '#validators/linear.ts';
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

export const ProjectLinearIssue = table(
	'ProjectLinearIssue',
	v.object({
		project: v.id('Project'),
		organization: v.id('Organization'),

		// Linear issue information
		team: vNew(vNullable(linearTeamValidator)),
		linearProject: vNew(vNullable(linearProjectValidator)),
		priority: vNew(vNullable(linearPriorityValidator)),
		status: vNew(vNullable(linearStatusValidator)),
		labels: vVirtualArray('ProjectLinearIssueLabel'),
		assignee: vNew(vNullable(linearAssigneeValidator)),
		identifier: v.string(),
		issueId: v.string(),
		issueUrl: v.string(),

		priorityLabel: vDeprecated<string>('Use `priority.label` instead'),
		priorityValue: vDeprecated<string>('Use `priority.value` instead'),
		projectId: vDeprecated<string>('Use `project.id` instead'),
		projectName: vDeprecated<string>('Use `project.name` instead'),
		statusId: vDeprecated<string>('Use `status.id` instead'),
		statusName: vDeprecated<string>('Use `status.name` instead'),
		teamId: vDeprecated<string>('Use `team.id` instead'),
		teamName: vDeprecated<string>('Use `team.name` instead'),
		assigneeId: vDeprecated<string>('Use `assignee.id` instead'),
		assigneeName: vDeprecated<string>('Use `assignee.name` instead'),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_project', ['project'])
			.index('by_organization', ['organization'])
			.index('by_assigneeId', ['assignee.id'])
			.index('by_identifier', ['identifier'])
			.index('by_issueId', ['issueId'])
			.index('by_linearProjectId', ['linearProject.id'])
			.index('by_statusId', ['status.id'])
			.index('by_teamId', ['team.id'])
			// The identifier of a label is the label name, which can be shared across linear projects, so it needs to be sub-indexed
			.index('by_project_priorityLabel', ['project', 'priority.label'])
			.index('by_organization_priorityLabel', [
				'organization',
				'priority.label',
			]),
)({
	assignee: { default: () => null },
	linearProject: { default: () => null },
	priority: { default: () => null },
	status: { default: () => null },
	team: { default: () => null },
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
	labels: virtualArray<typeof $.ProjectLinearIssueLabel>(
		'ProjectLinearIssueLabel',
		'by_projectLinearIssue',
	),
});
