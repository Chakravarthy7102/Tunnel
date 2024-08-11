import { z } from '@-/zod';

export const asanaProjectSchema = z.object({
	gid: z.string(),
	name: z.string(),
});

export const asanaSectionSchema = z.object({
	gid: z.string(),
	name: z.string(),
});

export const asanaAssigneeSchema = z.object({
	gid: z.string(),
	name: z.string(),
	photo: z.string().nullable(),
});

export const asanaParentTaskSchema = z.object({
	gid: z.string(),
	name: z.string(),
});

export const asanaTagSchema = z.object({
	gid: z.string(),
	name: z.string(),
});

export const createdAsanaTaskSchema = z.object({
	project: asanaProjectSchema.nullable(),
	gid: z.string(),
	url: z.string(),
	tags: z.array(z.string()).optional(),
	parentTask: z.null(),
	assignee: asanaAssigneeSchema.nullable(),
	section: asanaSectionSchema.nullable(),
});

export const asanaFormSchema = z.object({
	name: z.string().nullable().optional(),
	project: asanaProjectSchema.nullable(),
	section: asanaSectionSchema.nullable(),
	assignee: asanaAssigneeSchema.nullable(),
	parentTask: z.null(),
	tags: z.array(asanaTagSchema),
});

export const asanaOrganizationSchema = z.object({
	refresh_token: z.string().nullable(),
	access_token: z.string().nullable(),
	expires_in: z.number().nullable(),
	created_at: z.number().nullable(),
	gid: z.string().nullable(),
});

export const asanaSettingsSchema = z.object({
	default: asanaFormSchema.nullable(),
	createAutomatically: z.boolean(),
});
