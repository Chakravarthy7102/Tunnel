import type { WorkosUser } from '@-/auth';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { ApiUser } from '@-/user/api';

export async function WebappApiRedirect_getHomeRedirectPath({
	actorUser,
	organization,
	project,
}: {
	actorUser: { _id: Id<'User'> } | WorkosUser;
	organization?: { slug: string };
	project?: { slug: string };
}): Promise<string> {
	if (project !== undefined && organization !== undefined) {
		return `/${organization.slug}/projects/${project.slug}`;
	}

	if (organization !== undefined) {
		return `/${organization.slug}`;
	}

	const user = await ApiConvex.v.User.get({
		from: '_id' in actorUser ? { id: actorUser._id } : {
			id: await ApiUser.ensureFromWorkosUser({
				input: { workosUser: actorUser },
			}).unwrapOrThrow(),
		},
		include: {
			organizationMemberships: {
				include: {
					organization: true,
				},
			},
		},
	}).unwrapOrThrow();

	if (
		user === null ||
		user.organizationMemberships.length === 0 ||
		user.organizationMemberships[0] === undefined
	) {
		return '/welcome';
	}

	return `/${user.organizationMemberships[0].organization.slug}`;
}
