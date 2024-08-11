'use client';

import {
	HeaderContainer,
	HeaderTitle,
} from '#app/(webapp)/(logged-in)/[organization-slug]/(members)/header.tsx';
import { CreateTunnelButton } from '#components/v1/create-tunnel-button.tsx';
import { DashboardContainer } from '#components/v1/dashboard/layout/container.tsx';
import { useRouteContext } from '#utils/route-context.ts';

import { NavigationButton } from '#components/v1/navigation-button.tsx';
import { usePreloadedQueryState } from '#hooks/preload.ts';
import type { NonNullPreloaded } from '#types';
import type { api } from '@-/database';
import { usePathname, useRouter } from 'next/navigation';
import { type PropsWithChildren } from 'react';
import LayoutContext from './context.ts';

export default function ProjectClientLayout({
	preloadedProject,
	children,
}: PropsWithChildren<{
	preloadedProject: NonNullPreloaded<
		typeof api.v.Project_get_dashboardPageData
	>;
}>) {
	const { organization, actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const [project, setProject] = usePreloadedQueryState(preloadedProject);
	const router = useRouter();
	const pathname = usePathname();

	if (project === null) {
		router.push(`/${organization.slug}`);
		return null;
	}

	const isInPreview = pathname.includes('/previews/');
	const navigationPath = pathname.split('/')[4];

	return (
		<LayoutContext.Provider value={{ project, setProject }}>
			{!isInPreview ?
				(
					<>
						<HeaderContainer
							breadcrumbs={[
								{
									href: `/${project.organization.slug}`,
									label: project.organization.name,
								},
							]}
						>
							<HeaderTitle
								actorOrganizationMember={actorOrganizationMember}
							>
								{project.name}
							</HeaderTitle>

							<div className="flex flex-row justify-center items-center gap-x-1">
								<CreateTunnelButton size="sm">
									New live preview
								</CreateTunnelButton>
							</div>
						</HeaderContainer>
						<HeaderContainer>
							<div className="flex flex-row justify-start items-center gap-x-2">
								<NavigationButton
									href={`/${organization.slug}/projects/${project.slug}`}
									isActive={navigationPath === undefined}
								>
									Home
								</NavigationButton>
								<NavigationButton
									href={`/${organization.slug}/projects/${project.slug}/previews`}
									isActive={navigationPath === 'previews'}
								>
									Previews
								</NavigationButton>
								{actorOrganizationMember.role !== 'guest' && (
									<NavigationButton
										href={`/${organization.slug}/projects/${project.slug}/people`}
										isActive={navigationPath === 'people'}
									>
										People
									</NavigationButton>
								)}
								{actorOrganizationMember.role !== 'member' &&
									actorOrganizationMember.role !== 'guest' && (
									<NavigationButton
										href={`/${organization.slug}/projects/${project.slug}/integrations`}
										isActive={navigationPath === 'integrations'}
									>
										Integrations
									</NavigationButton>
								)}
								{actorOrganizationMember.role !== 'member' &&
									actorOrganizationMember.role !== 'guest' && (
									<NavigationButton
										href={`/${organization.slug}/projects/${project.slug}/settings`}
										isActive={navigationPath === 'settings'}
									>
										Settings
									</NavigationButton>
								)}
							</div>
						</HeaderContainer>

						<DashboardContainer>{children}</DashboardContainer>
					</>
				) :
				children}
		</LayoutContext.Provider>
	);
}
