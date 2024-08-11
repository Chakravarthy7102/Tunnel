import { v } from '@-/convex/values';
import { vDeprecated, vNullable } from 'corvex';

export const asanaProjectValidator = v.object({
	gid: v.string(),
	name: v.string(),
});

export const asanaAssigneeValidator = v.object({
	gid: v.string(),
	name: v.string(),
	photo: vNullable(v.string()),
});

export const asanaSectionValidator = v.object({
	gid: v.string(),
	name: v.string(),
});

export const asanaParentTaskValidator = v.object({
	gid: v.string(),
	name: v.string(),
});

export const asanaTagValidator = v.object({
	gid: v.string(),
	name: v.string(),
});

export const asanaOrganizationValidator = v.object({
	refresh_token: vNullable(v.string()),
	access_token: vNullable(v.string()),
	expires_in: vNullable(v.number()),
	created_at: vNullable(v.number()),
	gid: vNullable(v.string()),
	default: vDeprecated('Defaults settings are now in project.asanaSettings'),
	createAutomatically: vDeprecated(
		'Default settings are now in project.asanaSettings',
	),
});

export const asanaSettingsValidator = v.object({
	default: vNullable(
		v.object({
			name: v.optional(vNullable(v.string())),
			title: v.optional(vNullable(v.string())),
			project: vNullable(asanaProjectValidator),
			section: vNullable(asanaSectionValidator),
			assignee: vNullable(asanaAssigneeValidator),
			parentTask: v.null(),
			tags: v.array(asanaTagValidator),
		}),
	),
	createAutomatically: v.boolean(),
});
