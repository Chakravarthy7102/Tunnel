'use client';

import { OrganizationDeleteCard } from '#components/v1/cards/organization/organization-delete-card.tsx';
import { OrganizationInviteCard } from '#components/v1/cards/organization/organization-invite-card.tsx';
import { OrganizationSettingsCard } from '#components/v1/cards/organization/organization-settings-card.tsx';
import { useRouteContext } from '#utils/route-context.ts';

export default function OrganizationSettingsClientPage() {
	const { actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	return (
		<>
			<OrganizationSettingsCard />
			<OrganizationInviteCard />
			{actorOrganizationMember.role === 'owner' && <OrganizationDeleteCard />}
		</>
	);
}
