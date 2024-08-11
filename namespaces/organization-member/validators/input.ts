import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getActorUser } from '@-/database/function-utils';
import { getIdSchema } from '@-/database/schemas';
import type { OrganizationMemberRoleInputOptions } from '@-/organization-member';
import { unreachableCase } from '@tunnel/ts';

type OrganizationMemberInputSchemaOptions = {
	actorRelation: 'anyone' | 'notActor';
	actorOrganizationMemberRole: OrganizationMemberRoleInputOptions;
	targetOrganizationMemberRole: OrganizationMemberRoleInputOptions;
} | {
	actorRelation: 'actor';
	actorOrganizationMemberRole: OrganizationMemberRoleInputOptions;
};

export function getOrganizationMemberInputSchema(
	ctx: QueryCtx,
	args: ArgsWithToken,
	options: OrganizationMemberInputSchemaOptions,
) {
	return getIdSchema(ctx, 'OrganizationMember').refine(async (id) => {
		const organizationMember = await ctx.db.get(id);
		if (organizationMember === null) {
			return false;
		}

		const actorUser = await getActorUser(ctx, args);

		const actorOrganizationMember = await ctx.db.query('OrganizationMember')
			.withIndex(
				'by_organization_user',
				(q) =>
					q.eq('organization', organizationMember.organization).eq(
						'user',
						actorUser._id,
					),
			).first();

		if (actorOrganizationMember === null) {
			throw new Error('Not a member of this organization');
		}

		if (
			!options.actorOrganizationMemberRole[actorOrganizationMember.role]
		) {
			throw new Error('Insufficient permissions');
		}

		if (
			options.actorRelation === 'actor' &&
			actorUser._id !== organizationMember.user
		) {
			throw new Error('Not permitted to perform action on user');
		}

		switch (options.actorRelation) {
			case 'anyone': {
				break;
			}

			case 'actor': {
				if (organizationMember.user !== actorUser._id) {
					throw new Error(
						'Actor must be the same user as the organization member.',
					);
				}

				break;
			}

			case 'notActor': {
				if (organizationMember.user === actorUser._id) {
					throw new Error(
						'Actor cannot be the same user as the organization member.',
					);
				}

				break;
			}

			default: {
				return unreachableCase(
					options,
					`Invalid actor relation: ${JSON.stringify(options)}`,
				);
			}
		}

		return true;
	});
}
