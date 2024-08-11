import { z } from '@-/zod';

export const linearTeamSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export const linearProjectSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export const linearPrioritySchema = z.object({
	label: z.string(),
	priority: z.number(),
});

export const linearStatusSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export const linearLabelSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export const linearAssigneeSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export const createdLinearIssueSchema = z.object({
	team: linearTeamSchema,
	project: linearProjectSchema.nullable(),
	priority: linearPrioritySchema.nullable(),
	status: linearStatusSchema.nullable(),
	labels: z.array(linearLabelSchema),
	assignee: linearAssigneeSchema.nullable(),
	identifier: z.string(),
	id: z.string(),
	url: z.string(),
});

export const linearFormSchema = z.object({
	title: z.string().nullable().optional(),
	team: linearTeamSchema.nullable(),
	project: linearProjectSchema.nullable(),
	priority: linearPrioritySchema.nullable(),
	status: linearStatusSchema.nullable(),
	labels: z.array(linearLabelSchema),
	assignee: linearAssigneeSchema.nullable(),
});

export const linearOrganizationSchema = z.object({
	access_token: z.string().nullable(),
});

export const linearSettingsSchema = z.object({
	createAutomatically: z.boolean(),
	default: z
		.object({
			team: linearTeamSchema.nullable(),
			project: linearProjectSchema.nullable(),
			priority: linearPrioritySchema.nullable(),
			status: linearStatusSchema.nullable(),
			labels: z.array(linearLabelSchema),
			assignee: linearAssigneeSchema.nullable(),
		})
		.nullable(),
});
