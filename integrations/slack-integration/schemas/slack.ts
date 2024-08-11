import { z } from '@-/zod';

export const slackChannelSchema = z.object({
	id: z.string(),
	name: z.string(),
});

export const slackFormSchema = z.object({
	channel: slackChannelSchema.nullable(),
});

export const slackOrganizationSchema = z.object({
	accessToken: z.string(),
});

export const createdSlackMessageSchema = z.object({
	parentTS: z.string(),
	channelId: z.string(),
	channelName: z.string(),
	messageId: z.string(),
	permalink: z.string(),
});
