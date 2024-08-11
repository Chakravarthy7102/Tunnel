import type { ArgsWithToken, QueryCtx } from '@-/database';
import { getActorUser } from '@-/database/function-utils';
import { idSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';

interface ProjectRefinerOptions {
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
	options: ProjectRefinerOptions,
) {
	return idSchema('Project').refine(async (projectId) => {
		const user = await getActorUser(ctx, args);

		const project = await ctx.db.get(projectId);
		if (project === null) {
			throw new DocumentNotFoundError('Project');
		}

		const organization = await ctx.db.get(project.organization);

		if (organization === null) {
			throw new DocumentNotFoundError('Organization');
		}

		const actorOrganizationMember = await ctx.db.query('OrganizationMember')
			.withIndex(
				'by_organization_user',
				(q) => q.eq('organization', organization._id).eq('user', user._id),
			).first();

		if (actorOrganizationMember === null) {
			throw new Error("Must be a member of the project's organization");
		}

		if (
			!options.actorOrganizationMemberRole[actorOrganizationMember.role]
		) {
			throw new Error('Insufficient permissions');
		}

		return true;
	});
}
