'use client';

import {
	HeaderContainer,
	HeaderTitle,
} from '#app/(webapp)/(logged-in)/[organization-slug]/(members)/header.tsx';
import { NavigationButton } from '#components/v1/navigation-button.tsx';
import { useRouteContext } from '#utils/route-context.ts';
import { usePathname } from 'next/navigation';
import type { PropsWithChildren } from 'react';

export function OrganizationSettingsHeader({
	children,
}: PropsWithChildren) {
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const pathname = usePathname();

	const navigationPath = pathname.split('/')[3];
	const isOwnerOrAdmin = actorOrganizationMember.role === 'owner' ||
		actorOrganizationMember.role === 'admin';

	if (
		pathname.endsWith('settings/integrations/jira') &&
		(!organization.jiraOrganization ||
			!organization.jiraOrganization.webTriggerUrl)
	) {
		return children;
	}

	return (
		<>
			<HeaderContainer>
				<HeaderTitle
					actorOrganizationMember={actorOrganizationMember}
				>
					Organization settings
				</HeaderTitle>
			</HeaderContainer>
			<HeaderContainer>
				<div className="flex flex-row justify-start items-center gap-x-2">
					{isOwnerOrAdmin && (
						<NavigationButton
							href={`/${organization.slug}/settings`}
							isActive={navigationPath === undefined}
						>
							General
						</NavigationButton>
					)}

					<NavigationButton
						href={`/${organization.slug}/settings/people`}
						isActive={navigationPath === 'people'}
					>
						People
					</NavigationButton>

					{isOwnerOrAdmin && (
						<>
							<NavigationButton
								href={`/${organization.slug}/settings/billing`}
								isActive={navigationPath === 'billing'}
							>
								Billing
							</NavigationButton>
						</>
					)}

					<NavigationButton
						href={`/${organization.slug}/settings/integrations`}
						isActive={navigationPath === 'integrations'}
					>
						Integrations
					</NavigationButton>
					<NavigationButton
						href={`/${organization.slug}/settings/profile`}
						isActive={navigationPath === 'profile'}
					>
						Profile
					</NavigationButton>
				</div>
			</HeaderContainer>
		</>
	);
}
