import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getActorUser } from '@-/database/function-utils';
import { idSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';
import type { OrganizationMemberRoleInputOptions } from '@-/organization-member';
import { unreachableCase } from '@tunnel/ts';

type OrganizationMemberIdSchemaOptions = {
	actorRelation: 'anyone' | 'notActor';
	actorOrganizationMemberRole: OrganizationMemberRoleInputOptions;
	targetOrganizationMemberRole: OrganizationMemberRoleInputOptions;
} | {
	actorRelation: 'actor';
	actorOrganizationMemberRole: OrganizationMemberRoleInputOptions;
};

/**
	@example ```
		WebappApiInput.organizationMember(options)(input, ctx)
	```
*/
export function getOrganizationMemberIdSchema(
	ctx: QueryCtx,
	args: ArgsWithToken,
	options: OrganizationMemberIdSchemaOptions,
) {
	return idSchema('OrganizationMember').refine(
		async (organizationMemberId) => {
			const user = await getActorUser(ctx, args);

			const actorOrganizationMember = await ctx.db.get(organizationMemberId);
			if (actorOrganizationMember === null) {
				throw new DocumentNotFoundError('OrganizationMember');
			}

			if (
				!options.actorOrganizationMemberRole[actorOrganizationMember.role]
			) {
				throw new Error('Insufficient permissions');
			}

			if (
				options.actorRelation === 'actor' &&
				user._id !== actorOrganizationMember.user
			) {
				throw new Error('Not permitted to perform action on user');
			}

			switch (options.actorRelation) {
				case 'anyone': {
					break;
				}

				case 'actor': {
					if (actorOrganizationMember.user !== user._id) {
						throw new Error(
							'Actor must be the same user as the organization member.',
						);
					}

					break;
				}

				case 'notActor': {
					if (actorOrganizationMember.user === user._id) {
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
		},
	);
}
