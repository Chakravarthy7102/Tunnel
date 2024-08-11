import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getActorUser } from '@-/database/function-utils';
import { idSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';
import type { OrganizationMemberRoleInputOptions } from '@-/organization-member';
import { unreachableCase } from '@tunnel/ts';

type OrganizationRefinerOptions = {
	actorOrganizationMemberRole: OrganizationMemberRoleInputOptions;
} & {
	plans: 'any' | 'teamOrHigher' | 'enterprise';
};

/**
	@example ```
		WebappApiInput.organization(options)(input, ctx)
	```
*/
export function getOrganizationIdSchema(
	ctx: QueryCtx,
	args: ArgsWithToken,
	options: OrganizationRefinerOptions,
) {
	return idSchema('Organization').refine(
		async (organizationId) => {
			const user = await getActorUser(ctx, args);

			const organization = await ctx.db.get(organizationId);
			if (organization === null) {
				throw new DocumentNotFoundError('Organization');
			}

			// We don't check permissions for demo organizations
			if (organization.isDemo) {
				return true;
			}

			const organizationMember = await ctx.db.query('OrganizationMember')
				.withIndex(
					'by_organization_user',
					(q) => q.eq('organization', organizationId).eq('user', user._id),
				).first();

			if (organizationMember === null) {
				throw new Error('Must be a member of this organization');
			}

			if (!options.actorOrganizationMemberRole[organizationMember.role]) {
				throw new Error(
					'Insufficient permissions to access this organization.',
				);
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
		},
	);
}
