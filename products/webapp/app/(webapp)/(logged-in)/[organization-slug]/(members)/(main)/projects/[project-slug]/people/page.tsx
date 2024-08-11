import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiOrganizationMember } from '#api-organization-member';
import { WebappApiProject } from '#api-project';
import { ApiConvex } from '@-/convex/api';
import { getVapi } from '@-/database/vapi';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import PageClient from './page.client.tsx';

export default async function OrganizationPeople({
	params: {
		'project-slug': projectSlug,
		'organization-slug': organizationSlug,
	},
}: {
	params: { 'project-slug': string; 'organization-slug': string };
}) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		slug: organizationSlug,
		actorUser,
		include: {},
	});

	const organizationMember = await WebappApiOrganizationMember.getOrRedirect({
		actorUser,
		organization,
		include: {},
	});

	if (organizationMember.role === 'guest') {
		return redirect(`/${organizationSlug}/projects/${projectSlug}`);
	}

	const project = await WebappApiProject.getBySlugOrRedirect({
		actorUser,
		organization,
		slug: projectSlug,
		include: {},
	});

	const vapi = await getVapi();
	const preloadedOrganizationInvitations = await ApiConvex
		.preloadProtectedQuery(
			vapi.v.OrganizationInvitation_list_dashboardPageData,
			{
				where: {
					project: project._id,
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
					includeProjectGuests: [project._id],
				},
				paginationOpts: {
					cursor: null,
					numItems: 100,
				},
			},
			{ token: null },
		);

	return (
		<PageClient
			preloadedOrganizationInvitations={preloadedOrganizationInvitations}
			preloadedOrganizationMembers={preloadedOrganizationMembers}
		/>
	);
}
