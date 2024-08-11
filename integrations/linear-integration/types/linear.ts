import type {
	createdLinearIssueSchema,
	linearAssigneeSchema,
	linearFormSchema,
	linearLabelSchema,
	linearPrioritySchema,
	linearProjectSchema,
	linearSettingsSchema,
	linearStatusSchema,
	linearTeamSchema,
} from '#schemas/linear.ts';
import type { createLinearFilterChoicesMaps } from '#utils/filter.ts';
import type { linearOrganizationValidator } from '#validators/linear.ts';
import type { Infer } from '@-/convex/values';
import type { z } from '@-/zod';
import type { OrderedMap } from 'js-sdsl';

export type LinearFilterChoices = {
	[$Key in keyof ReturnType<typeof createLinearFilterChoicesMaps>]: ReturnType<
		typeof createLinearFilterChoicesMaps
	>[$Key] extends OrderedMap<string, infer $Value> ? Record<string, $Value> :
		never;
};

export type LinearTeam = z.infer<typeof linearTeamSchema>;
export type LinearProject = z.infer<typeof linearProjectSchema>;
export type LinearPriority = z.infer<typeof linearPrioritySchema>;
export type LinearStatus = z.infer<typeof linearStatusSchema>;
export type LinearLabel = z.infer<typeof linearLabelSchema>;
export type LinearAssignee = z.infer<typeof linearAssigneeSchema>;
export type LinearIssue = z.infer<typeof createdLinearIssueSchema>;
export type LinearForm = z.infer<typeof linearFormSchema>;
export type LinearOrganization = Infer<typeof linearOrganizationValidator>;
export type LinearSettings = z.infer<typeof linearSettingsSchema>;
