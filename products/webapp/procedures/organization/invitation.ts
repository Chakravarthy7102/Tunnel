import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ProcedureError } from '@-/errors';
import { ApiOrganizationInvitation } from '@-/organization-invitation/api';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { ApiUrl } from '@-/url/api';
import { z } from '@-/zod';
import { $try, ok, Result } from 'errok';

export const organization_sendInvitations = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			senderUser: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
				plans: 'any',
			})(input, ctx),
			invitations: z.array(
				z.union([
					z.object({
						emailAddress: z.string(),
						role: z.enum(['member', 'admin']),
					}),
					z.object({
						emailAddress: z.string(),
						role: z.literal('guest'),
						authorizedProject: WebappApiInput.project({
							actor,
							actorOrganizationMemberRole:
								OrganizationMemberRoleInput.memberOrHigher,
						})(input, ctx),
					}),
					z.object({
						recipientUser: WebappApiInput.user({
							actor,
							actorRelation: 'notActor',
						})(input, ctx),
						role: z.enum(['member', 'admin']),
					}),
					z.object({
						recipientUser: WebappApiInput.user({
							actor,
							actorRelation: 'notActor',
						})(input, ctx),
						role: z.literal('guest'),
						authorizedProject: WebappApiInput.project({
							actor,
							actorOrganizationMemberRole:
								OrganizationMemberRoleInput.memberOrHigher,
						})(input, ctx),
					}),
				]),
			),
		})),
	mutation: async ({ input, ctx }) => ($try(async function*() {
		const senderUserId = yield* input.senderUser.safeUnwrap();
		const organizationId = yield* input.organization.safeUnwrap();
		const invitations = yield* Result.combine(
			input.invitations.map((invitation) => ($try(function*() {
				return ok(
					'recipientUser' in invitation ?
						{
							recipientUser: yield* invitation.recipientUser.safeUnwrap(),
							role: invitation.role,
						} :
						'authorizedProject' in invitation ?
						{
							emailAddress: invitation.emailAddress,
							role: invitation.role,
							authorizedProject: yield* invitation.authorizedProject
								.safeUnwrap(),
						} :
						invitation,
				);
			}))),
		).safeUnwrap();
		return ApiOrganizationInvitation.createAndSend({
			webappBaseUrl: ApiUrl.getWebappUrl({
				fromHeaders: ctx.headers,
				withScheme: true,
			}),
			// @ts-expect-error: todo
			invitations,
			senderUserId,
			organizationId,
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't send organization invitations", error),
});

export const organization_acceptInvitation = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			recipientUser: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			organizationInvitation: WebappApiInput.organizationInvitation({
				actor,
				actorRelation: 'recipient',
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const recipientUserId = yield* input.recipientUser.safeUnwrap();
		const organizationInvitationId = yield* input.organizationInvitation
			.safeUnwrap();
		return ApiOrganizationInvitation.accept({
			organizationInvitationId,
			recipientUserId,
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't accept invitation", error),
});

export const organization_declineInvitation = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationInvitation: WebappApiInput.organizationInvitation({
				actor,
				actorRelation: 'recipient',
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationInvitationId = yield* input.organizationInvitation
			.safeUnwrap();
		return ApiOrganizationInvitation.decline({
			organizationInvitationId,
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't decline invitation", error),
});

export const organization_revokeInvitation = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationInvitation: WebappApiInput.organizationInvitation({
				actor,
				actorRelation: 'sender',
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationInvitationId = yield* input.organizationInvitation
			.safeUnwrap();
		yield* ApiOrganizationInvitation.revoke({
			organizationInvitationId,
		}).safeUnwrap();
		return ok();
	})),
	error: ({ error }) => new ProcedureError("Couldn't cancel invitation", error),
});
