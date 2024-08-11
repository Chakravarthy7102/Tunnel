'use client';
import {
	HeaderContainer,
	HeaderTitle,
} from '#app/(webapp)/(logged-in)/[organization-slug]/(members)/header.tsx';
import { Connect } from '#components/v1/dashboard/connect.tsx';
import { DashboardContainer } from '#components/v1/dashboard/layout/container.tsx';
import { useRouteContext } from '#utils/route-context.ts';
import { buttonVariants, cn } from '@-/design-system/v1';
import { ExternalLink } from 'lucide-react';

export default function GetStartedClient() {
	const { actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	return (
		<>
			<HeaderContainer>
				<HeaderTitle
					actorOrganizationMember={actorOrganizationMember}
				>
					Get started
				</HeaderTitle>
				<a
					target="_blank"
					href="https://docs.tunnel.dev"
					className={cn(buttonVariants({ variant: 'outline' }))}
				>
					Docs <ExternalLink size={16} />
				</a>
			</HeaderContainer>
			<DashboardContainer>
				<Connect />
			</DashboardContainer>
		</>
	);
}
