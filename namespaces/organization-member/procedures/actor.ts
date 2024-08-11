import { ApiOrganizationMember } from '#api';
import { OrganizationMemberRoleInput } from '#constants/role.ts';
import { ApiConvex } from '@-/convex/api';
import type { Selection } from '@-/database';
import { getInclude } from '@-/database/selection-utils';
import { DocumentNotFoundError, ProcedureError } from '@-/errors';
import { WebappApiInput } from '@-/webapp/api-input';
import { defineProcedure } from '@-/webapp/procedure-utils';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';
import type { EmptyObject } from 'type-fest';

const createGetForUserProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			user: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			organization: WebappApiInput.organization({
				actor,
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
				plans: 'any',
			})(input, ctx),
		})),
	query: async ({ input }) => ($try(async function*() {
		const userId = yield* input.user.safeUnwrap();

		if (
			input.organization.isErr() &&
			input.organization.error instanceof DocumentNotFoundError
		) {
			return ok(null);
		}

		const organizationId = yield* input.organization.safeUnwrap();
		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: {
				user: userId,
				organization: organizationId,
			},
			include: getInclude(selection),
		}).safeUnwrap();

		if (organizationMember !== null) {
			return ok(organizationMember);
		}

		// If the organization member doesn't exist for a demo organization, we automatically create them
		const organization = yield* ApiConvex.v.Organization.get({
			from: { id: organizationId },
			include: {},
		}).safeUnwrap();

		if (organization === null) {
			return err(new DocumentNotFoundError('Organization'));
		}

		if (organization.isDemo) {
			return ApiOrganizationMember.create({
				input: {
					data: {
						user: userId,
						organization: organizationId,
						role: 'member',
					},
					include: getInclude(selection),
				},
			});
		}

		return ok(null);
	})),
	error: ({ error }) =>
		new ProcedureError("Couldn't get organization member data", error),
}));

export const organizationMember_getForUser = createGetForUserProcedure({});
