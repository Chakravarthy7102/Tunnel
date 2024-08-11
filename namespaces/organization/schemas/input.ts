import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getActorUser } from '@-/database/function-utils';
import { getIdSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';
import type { OrganizationMemberRoleInputOptions } from '@-/organization-member';
import { unreachableCase } from '@tunnel/ts';

interface OrganizationIdSchemaOptions {
	actorOrganizationMemberRole: OrganizationMemberRoleInputOptions;
	plans: 'any' | 'teamOrHigher' | 'enterprise';
}

export function getOrganizationIdSchema(
	ctx: QueryCtx,
	args: ArgsWithToken,
	options: OrganizationIdSchemaOptions,
) {
	return getIdSchema(ctx, 'Organization').refine(async (id) => {
		const organization = await ctx.db.get(id);
		if (organization === null) {
			throw new DocumentNotFoundError('Organization');
		}

		// We don't check permissions for demo organizations
		if (organization.isDemo) {
			return true;
		}

		const user = await getActorUser(ctx, args);

		const organizationMember = await ctx.db.query('OrganizationMember')
			.withIndex(
				'by_organization_user',
				(q) => q.eq('organization', id).eq('user', user._id),
			).first();

		if (organizationMember === null) {
			throw new Error('Must be member of organization');
		}

		if (!options.actorOrganizationMemberRole[organizationMember.role]) {
			throw new Error('Insufficient permissions');
		}

		switch (options.plans) {
			case 'any': {
				break;
			}

			case 'teamOrHigher': {
				const plans = ['team', 'enterprise'];
				if (!plans.includes(organization.subscriptionPlan)) {
					throw new Error(
						`Organization must be on one of the following plans: ${
							plans.join(
								', ',
							)
						}`,
					);
				}

				break;
			}

			case 'enterprise': {
				const plans = ['enterprise'];
				if (!plans.includes(organization.subscriptionPlan)) {
					throw new Error(
						`Organization must be on one of the following plans: ${
							plans.join(
								', ',
							)
						}`,
					);
				}

				break;
			}

			default: {
				return unreachableCase(
					options.plans,
					`Unknown organization type: ${String(options.plans)}`,
				);
			}
		}

		return true;
	});
}
