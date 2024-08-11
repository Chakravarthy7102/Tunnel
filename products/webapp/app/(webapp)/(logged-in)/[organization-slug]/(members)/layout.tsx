import { WebappApiActor } from '#api-actor';
import { WebappApiRedirect } from '#api-redirect';
import { isNonNullPreloaded } from '#utils/preload.ts';
import { ApiConvex } from '@-/convex/api';
import { preloadedQueryResult } from '@-/convex/nextjs';
import { getVapi } from '@-/database/vapi';
import { organizationSlugSchema } from '@-/organization/schemas';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import LayoutClient from './layout.client.tsx';

export default async function OrganizationMemberLayout({
	params: { 'organization-slug': organizationSlug },
	children,
}: React.PropsWithChildren<{
	params: { 'organization-slug': string };
}>) {
	if (!organizationSlugSchema.safeParse(organizationSlug).success) {
		return redirect('/home');
	}

	const actorUser = await WebappApiActor.from(getUser(), {
		include: {},
	});
	const vapi = await getVapi();
	const preloadedOrganization = await ApiConvex.preloadProtectedQuery(
		vapi.v.Organization_get_dashboardPageData,
		{ from: { slug: organizationSlug } },
		{ token: null },
	);

	if (isNonNullPreloaded(preloadedOrganization)) {
		const organization = preloadedQueryResult(preloadedOrganization);
		const preloadedActorOrganizationMember = await ApiConvex
			.preloadProtectedQuery(
				vapi.v.OrganizationMember_get_actorProfileData,
				{
					from: {
						organization: organization._id,
						user: actorUser._id,
					},
				},
				{ token: null },
			);

		if (isNonNullPreloaded(preloadedActorOrganizationMember)) {
			const actorOrganizationMember = preloadedQueryResult(
				preloadedActorOrganizationMember,
			);
			const preloadedProjects = await ApiConvex.preloadProtectedQuery(
				vapi.v.Project_list_dashboardPageData,
				{
					where: {
						organizationMember: actorOrganizationMember._id,
					},
					paginationOpts: {
						cursor: null,
						numItems: 100,
					},
				},
				{ token: null },
			);

			return (
				<LayoutClient
					preloadedProjects={preloadedProjects}
					preloadedOrganization={preloadedOrganization}
					preloadedActorOrganizationMember={preloadedActorOrganizationMember}
				>
					{children}
				</LayoutClient>
			);
		}
	}

	// Organization doesn't exist or the user is not a member of the organization
	return redirect(
		await WebappApiRedirect.getHomeRedirectPath({ actorUser }),
	);
}
