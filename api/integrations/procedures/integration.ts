import * as tables from '#tables/_.ts';
import { ApiConvex } from '@-/convex/api';
import { ProcedureError } from '@-/errors';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { WebappApiInput } from '@-/webapp/api-input';
import { z } from '@-/zod';
import { objectKeys } from '@tunnel/ts';
import { $try, ok } from 'errok';
import { includeKeys } from 'filter-obj';
// eslint-disable-next-line @tunnel/no-relative-import-paths/no-relative-import-paths -- This breaks Next.js builds for some reason
import { defineProcedure } from '@-/webapp/procedure-utils';

const accountTables = includeKeys(tables, (key) => key.endsWith('Account')) as {
	[
		$Key in keyof typeof tables as $Key extends `${string}Account` ? $Key :
			never
	]: typeof tables[$Key];
};

export const organizationMemberIntegration_delete = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			// @ts-expect-error: works
			type: z.enum(objectKeys(accountTables)),
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember
			.safeUnwrap();
		yield* ApiConvex.v.OrganizationMemberIntegration.delete({
			input: {
				// @ts-expect-error: todo
				type: input.type,
				where: {
					organizationMember: organizationMemberId,
				},
			},
		}).safeUnwrap();
		return ok();
	})),
	error: ({ error, input }) =>
		new ProcedureError(
			`Couldn't remove ${
				input.type.replace(/^OrganizationMember/, '').replace(/Account$/, '')
			} integration`,
			error,
		),
});

export const organizationMemberIntegration_update = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			// @ts-expect-error: works
			type: z.enum(objectKeys(accountTables)),
			organizationMember: WebappApiInput.organizationMember({
				actor,
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			})(input, ctx),
			updates: z.object({
				accessToken: z.string(),
				refreshToken: z.string(),
				expiresIn: z.number(),
			}),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const organizationMemberId = yield* input.organizationMember.safeUnwrap();
		yield* ApiConvex.v.OrganizationMemberIntegration
			.update({
				input: {
					// @ts-expect-error: todo
					type: input.type,
					updates: input.updates,
					where: {
						organizationMember: organizationMemberId,
					},
				},
			}).safeUnwrap();
		return ok();
	})),
	error: ({ input, error }) =>
		new ProcedureError(
			`Couldn't update ${
				input.type.replace(/^OrganizationMember/, '').replace(/Account$/, '')
			} integration`,
			error,
		),
});
