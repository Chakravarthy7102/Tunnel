import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiRedirect } from '#api-redirect';
import { ApiConvex } from '@-/convex/api';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export default async function Layout({
	params: { 'organization-slug': organizationSlug },
	children,
}: React.PropsWithChildren<{
	params: { 'organization-slug': string };
}>) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		actorUser,
		slug: organizationSlug,
		include: {},
	});

	const { page: organizationMembers } = await ApiConvex.v.OrganizationMember
		.list({
			include: {
				user: true,
			},
			where: {
				organization: organization._id,
				includeProjectGuests: true,
			},
			paginationOpts: {
				cursor: null,
				numItems: 100,
			},
		}).unwrapOrThrow();

	const actorOrganizationMember = organizationMembers.find(
		(organizationMember) => organizationMember.user._id === actorUser._id,
	);

	if (actorOrganizationMember === undefined) {
		return redirect(
			await WebappApiRedirect.getHomeRedirectPath({ actorUser, organization }),
		);
	} else {
		if (
			actorOrganizationMember.role !== 'member' &&
			actorOrganizationMember.role !== 'admin' &&
			actorOrganizationMember.role !== 'owner'
		) {
			return redirect(`/${organizationSlug}/settings/integrations`);
		}

		return <>{children}</>;
	}
}
