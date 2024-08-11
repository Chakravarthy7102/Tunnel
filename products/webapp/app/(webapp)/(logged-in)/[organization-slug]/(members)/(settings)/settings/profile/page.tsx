import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiRedirect } from '#api-redirect';
import { ApiConvex } from '@-/convex/api';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import ProfileClient from './page.client.tsx';

export default async function Profile({
	params: { 'organization-slug': organizationSlug },
}: {
	params: { 'organization-slug': string };
}) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		actorUser,
		slug: organizationSlug,
		include: {},
	});

	const organizationMember = await ApiConvex.v.OrganizationMember.get({
		from: {
			organization: organization._id,
			user: actorUser._id,
		},
		include: {},
	}).unwrapOrThrow();

	if (organizationMember === null) {
		return redirect(
			await WebappApiRedirect.getHomeRedirectPath({ actorUser, organization }),
		);
	}

	return <ProfileClient />;
}
