import type {
	createdSlackMessageSchema,
	slackChannelSchema,
	slackFormSchema,
} from '#schemas/slack.ts';
import type { z } from '@-/zod';

export type SlackChannel = z.infer<typeof slackChannelSchema>;
export type SlackForm = z.infer<typeof slackFormSchema>;
export type SlackMessage = z.infer<typeof createdSlackMessageSchema>;
