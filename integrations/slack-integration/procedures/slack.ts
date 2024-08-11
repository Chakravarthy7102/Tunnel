import { ApiSlack } from '#exports/api.ts';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { WebappApiInput } from '@-/webapp/api-input';
import { z } from '@-/zod';
import { $try } from 'errok';
// eslint-disable-next-line @tunnel/no-relative-import-paths/no-relative-import-paths -- This breaks Next.js dev for some reason
import {
	defineProcedure,
} from '../../../products/webapp/exports/procedure-utils.ts';

export const slack_getChannels = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		return ApiSlack.getChannels({ organizationMemberId });
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't list Slack channels",
			error,
		),
});

export const slack_createMessage = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			project: WebappApiInput.project({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			commentThread: WebappApiInput.projectCommentThread({
				actor,
				actorRelation: 'author',
			})(input, ctx),
			channelId: z.string(),
			channelName: z.string(),
			content: z.string(),
			attachments: z.array(z.string()),
			tunnelUrl: z.string(),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const projectId = yield* input.project.safeUnwrap();
		const commentThreadId = yield* input.commentThread.safeUnwrap();

		const {
			channelId,
			content,
			attachments,
			tunnelUrl,
			channelName,
		} = input;

		return ApiSlack.createMessage({
			organizationMemberId,
			content,
			channelId,
			channelName,
			attachments,
			projectId,
			commentThreadId,
			tunnelUrl,
		});
	})),
	error: ({ error }) =>
		new ProcedureError(
			"Couldn't create Slack message",
			error,
		),
});
