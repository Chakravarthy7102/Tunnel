import { v } from '@-/convex/values';
import { vNullable } from 'corvex';

export const slackChannelValidator = v.object({
	id: v.string(),
	name: v.string(),
});

export const slackOrganizationValidator = v.object({
	accessToken: vNullable(v.string()),
});

export const slackCommentMetadataValidator = v.object({
	parentTS: v.string(),
	channelId: v.string(),
	channelName: v.string(),
	messageId: v.string(),
	permalink: v.string(),
});
