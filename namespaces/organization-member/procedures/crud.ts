import {
	ApiOrganizationMember,
} from '#api';
import { OrganizationMemberRoleInput } from '#constants/role.ts';
import { ApiConvex } from '@-/convex/api';
import type { Selection } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import {
	OrganizationMember_$organizationData,
} from '@-/database/selections';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';
import type { EmptyObject } from 'type-fest';

export const organizationMember_updateActor = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			updates: z.object({}),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		return ApiConvex.v.OrganizationMember.update({
			input: {
				id: organizationMemberId,
				updates: {
					...input.updates,
				},
			},
		});
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't update organization member", error),
});

export const organizationMember_leave = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				// The owner cannot leave an organization without first transfering it
				actorOrganizationMemberRole: OrganizationMemberRoleInput.notOwner,
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		return ApiOrganizationMember.remove({
			organizationMemberId,
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't remove member", error),
});

export const organizationMember_remove = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'notActor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.adminOrOwner,
				targetOrganizationMemberRole: OrganizationMemberRoleInput.guestOrMember,
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		return ApiOrganizationMember.remove({
			organizationMemberId,
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't remove member", error),
});

export const organizationMember_updateRole = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'notActor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.ownerOnly,
				targetOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			newRole: z.enum(['member', 'admin']),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: {
				id: organizationMemberId,
			},
			include: {},
		}).safeUnwrap();

		if (organizationMember === null) {
			return err(new DocumentNotFoundError('OrganizationMember'));
		}

		return ApiConvex.v.OrganizationMember.update({
			input: {
				id: organizationMember._id,
				updates: {
					role: input.newRole,
				},
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't update member", error),
});

const buildListProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			user: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			includeProjectGuests: z.boolean(),
		})),
	query: async ({ input }) => ($try(async function*() {
		const userId = yield* input.user.safeUnwrap();
		const { page } = yield* ApiConvex.v.OrganizationMember.list({
			include: getInclude(selection),
			where: {
				user: userId,
				includeProjectGuests: true,
			},
			paginationOpts: {
				cursor: null,
				numItems: 100,
			},
		}).safeUnwrap();
		return ok(page);
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't list organization memberships", error),
}));

export const organizationMember_list = buildListProcedure({});
export const organizationMember_list$organizationData = buildListProcedure(
	OrganizationMember_$organizationData,
);
