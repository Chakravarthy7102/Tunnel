import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { ApiConvex } from '@-/convex/api';
import { getVapi } from '@-/database/vapi';
import { getUser } from '@workos-inc/authkit-nextjs';
import OrganizationPeopleClientPage from './page.client.tsx';

export default async function OrganizationPeople({
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

	const vapi = await getVapi();
	const preloadedOrganizationInvitations = await ApiConvex
		.preloadProtectedQuery(
			vapi.v.OrganizationInvitation_list_dashboardPageData,
			{
				where: {
					organization: organization._id,
				},
				paginationOpts: {
					cursor: null,
					numItems: 100,
				},
			},
			{ token: null },
		);

	const preloadedOrganizationMembers = await ApiConvex
		.preloadProtectedQuery(
			vapi.v.OrganizationMember_list_dashboardPageData,
			{
				where: {
					organization: organization._id,
					includeProjectGuests: true,
				},
				paginationOpts: {
					cursor: null,
					numItems: 100,
				},
			},
			{ token: null },
		);

	return (
		<OrganizationPeopleClientPage
			preloadedOrganizationInvitations={preloadedOrganizationInvitations}
			preloadedOrganizationMembers={preloadedOrganizationMembers}
		/>
	);
}
