import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getActorUser } from '@-/database/function-utils';
import { getIdSchema } from '@-/database/schemas';

interface ProjectIdSchemaOptions {
	actorOrganizationMemberRole: {
		guest: boolean;
		member: boolean;
		admin: boolean;
		owner: boolean;
	};
}

export function getProjectIdSchema(
	ctx: QueryCtx,
	args: ArgsWithToken,
	options: ProjectIdSchemaOptions,
) {
	return getIdSchema(ctx, 'Project').refine(
		async (id) => {
			const project = await ctx.db.get(id);
			if (project === null) throw new Error('Project not found');
			const user = await getActorUser(ctx, args);
			const organization = await ctx.db.get(project.organization);

			if (organization === null) {
				throw new Error('Organization not found');
			}

			const actorOrganizationMember = await ctx.db.query(
				'OrganizationMember',
			)
				.withIndex(
					'by_organization_user',
					(q) => q.eq('organization', organization._id).eq('user', user._id),
				).first();

			if (actorOrganizationMember === null) {
				throw new Error('User is not a member of the organization');
			}

			if (
				!options.actorOrganizationMemberRole[actorOrganizationMember.role]
			) {
				throw new Error('User does not have the required role');
			}

			return true;
		},
	);
}
