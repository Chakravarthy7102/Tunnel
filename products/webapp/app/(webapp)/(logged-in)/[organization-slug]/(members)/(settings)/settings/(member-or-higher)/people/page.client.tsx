'use client';

import { NewOrganizationInvitationsCard } from '#components/v1/cards/organization/organization-invitation-card.tsx';
import { OrganizationPeopleCard } from '#components/v1/cards/organization/organization-people-card.tsx';
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
	const { organization, setOrganization, actorOrganizationMember } =
		useRouteContext(
			'(webapp)/(logged-in)/[organization-slug]/(members)',
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
			<NewOrganizationInvitationsCard
				actorUser={actorUser}
				actorOrganizationMember={actorOrganizationMember}
				organization={organization}
			/>
			<OrganizationPeopleCard
				actorUser={actorUser}
				actorOrganizationMember={actorOrganizationMember}
				organization={organization}
				setOrganization={setOrganization}
				organizationInvitations={organizationInvitations}
				setOrganizationInvitations={setOrganizationInvitations}
				organizationMembers={organizationMembers}
				setOrganizationMembers={setOrganizationMembers}
			/>
		</>
	);
}
