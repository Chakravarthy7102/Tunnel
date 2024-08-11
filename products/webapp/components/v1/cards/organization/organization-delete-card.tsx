import { DashboardCard } from '#components/v1/cards/card.tsx';
import { DeleteOrganizationButton } from '#components/v1/delete-organization-button.tsx';
import { useRouteContext } from '#utils/route-context.ts';

export function OrganizationDeleteCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	return (
		<DashboardCard
			isDanger
			title="Danger Zone"
			subtitle="Delete your organization"
			button={
				<DeleteOrganizationButton
					size="sm"
					variant="destructive"
					actorUser={actorUser}
					organization={organization}
				>
					Delete this organization
				</DeleteOrganizationButton>
			}
		/>
	);
}
