import { v } from '@-/convex/values';
import { vDeprecated, vNullable } from 'corvex';

export const linearTeamValidator = v.object({
	id: v.string(),
	name: v.string(),
});

export const linearProjectValidator = v.object({
	id: v.string(),
	name: v.string(),
});

export const linearPriorityValidator = v.object({
	label: v.string(),
	priority: v.number(),
});

export const linearStatusValidator = v.object({
	id: v.string(),
	name: v.string(),
});

export const linearAssigneeValidator = v.object({
	id: v.string(),
	name: v.string(),
});

export const linearLabelValidator = v.object({
	id: v.string(),
	name: v.string(),
});

export const linearOrganizationValidator = v.object({
	access_token: vNullable(v.string()),
	default: vDeprecated(
		'Default settings can now be found in project.linearSettings',
	),
	createAutomatically: vDeprecated(
		'Default settings can now be found in project.linearSettings',
	),
});

export const linearSettingsValidator = v.object({
	default: vNullable(
		v.object({
			team: vNullable(linearTeamValidator),
			project: vNullable(linearProjectValidator),
			priority: vNullable(linearPriorityValidator),
			status: vNullable(linearStatusValidator),
			assignee: vNullable(linearAssigneeValidator),
			labels: v.array(linearLabelValidator),
		}),
	),
	createAutomatically: v.boolean(),
});
