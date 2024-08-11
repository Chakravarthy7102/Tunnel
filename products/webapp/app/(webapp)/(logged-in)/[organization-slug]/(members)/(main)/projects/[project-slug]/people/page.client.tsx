'use client';

import { NewProjectInvitationsCard } from '#components/v1/cards/projects/project-invitations-card.tsx';
import { ProjectPeopleCard } from '#components/v1/cards/projects/project-people-card.tsx';
import { usePreloadedPaginatedQueryState } from '#hooks/preload.ts';
import { useRouteContext } from '#utils/route-context.ts';
import type { Preloaded } from '@-/convex/react';
import type { api } from '@-/database';

export default function OrganizationPeopleClientPage({
	preloadedOrganizationInvitations,
	preloadedOrganizationMembers,
}: {
	preloadedOrganizationInvitations: Preloaded<
		typeof api.v.OrganizationInvitation_list_dashboardPageData
	>;
	preloadedOrganizationMembers: Preloaded<
		typeof api.v.OrganizationMember_list_userData
	>;
}) {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { actorOrganizationMember, organization, setOrganization } =
		useRouteContext(
			'(webapp)/(logged-in)/[organization-slug]/(members)',
		);
	const { project } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);
	const [{ results: organizationInvitations }, setOrganizationInvitations] =
		usePreloadedPaginatedQueryState(
			preloadedOrganizationInvitations,
		);
	const [{ results: organizationMembers }, setOrganizationMembers] =
		usePreloadedPaginatedQueryState(
			preloadedOrganizationMembers,
		);

	return (
		<>
			<NewProjectInvitationsCard
				actorUser={actorUser}
				organization={organization}
				project={project}
				setOrganizationInvitations={setOrganizationInvitations}
			/>
			<ProjectPeopleCard
				actorUser={actorUser}
				actorOrganizationMember={actorOrganizationMember}
				organization={organization}
				setOrganization={setOrganization}
				project={project}
				organizationMembers={organizationMembers}
				setOrganizationMembers={setOrganizationMembers}
				organizationInvitations={organizationInvitations}
				setOrganizationInvitations={setOrganizationInvitations}
			/>
		</>
	);
}
