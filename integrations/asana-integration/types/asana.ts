import type {
	asanaAssigneeSchema,
	asanaFormSchema,
	asanaParentTaskSchema,
	asanaProjectSchema,
	asanaSectionSchema,
	asanaSettingsSchema,
	asanaTagSchema,
	createdAsanaTaskSchema,
} from '#schemas/asana.ts';
import type { asanaOrganizationValidator } from '#validators/asana.ts';
import type { Infer } from '@-/convex/values';
import type { z } from '@-/zod';

export type AsanaProject = z.infer<typeof asanaProjectSchema>;
export type AsanaSection = z.infer<typeof asanaSectionSchema>;
export type AsanaAssignee = z.infer<typeof asanaAssigneeSchema>;
export type AsanaParentTask = z.infer<typeof asanaParentTaskSchema>;
export type AsanaTag = z.infer<typeof asanaTagSchema>;
export type AsanaTask = z.infer<typeof createdAsanaTaskSchema>;
export type AsanaForm = z.infer<typeof asanaFormSchema>;
export type AsanaOrganization = Infer<typeof asanaOrganizationValidator>;
export type AsanaSettings = z.infer<typeof asanaSettingsSchema>;
