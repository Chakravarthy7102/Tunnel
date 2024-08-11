import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiRedirect } from '#api-redirect';
import { ApiConvex } from '@-/convex/api';
import { ApiOrganizationMember } from '@-/organization-member/api';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

/**
	This route is only valid for demo organizations.
*/
export default async function JoinOrganization({
	params: { 'organization-slug': organizationSlug },
}: {
	params: { 'organization-slug': string };
}) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		slug: organizationSlug,
		actorUser,
		include: {},
	});

	if (!organization.isDemo) {
		return redirect(
			await WebappApiRedirect.getHomeRedirectPath({ actorUser, organization }),
		);
	}

	// Automatically create an organization member for the user
	const organizationMember = await ApiConvex.v.OrganizationMember.get({
		from: { organization: organization._id, user: actorUser._id },
		include: {},
	}).unwrapOrThrow();

	if (organizationMember === null) {
		await ApiOrganizationMember.create({
			input: {
				data: {
					organization: organization._id,
					user: actorUser._id,
					role: 'member',
				},
				include: {},
			},
		}).unwrapOrThrow();
	}

	return redirect(`/${organizationSlug}`);
}
