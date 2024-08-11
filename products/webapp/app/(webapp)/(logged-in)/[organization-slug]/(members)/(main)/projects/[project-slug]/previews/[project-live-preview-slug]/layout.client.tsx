/* eslint-disable @typescript-eslint/no-non-null-assertion -- annoying */

'use client';

import {
	HeaderContainer,
	HeaderTitle,
} from '#app/(webapp)/(logged-in)/[organization-slug]/(members)/header.tsx';
import { DashboardContainer } from '#components/v1/dashboard/layout/container.tsx';
import { usePreloadedQueryState } from '#hooks/preload.ts';
import type { NonNullPreloaded } from '#types';
import { useRouteContext } from '#utils/route-context.ts';
import type { api } from '@-/database';
import { buttonVariants, cn } from '@-/design-system/v1';
import { getReleaseProjectLivePreviewUrl } from '@-/url';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type PropsWithChildren, useEffect, useState } from 'react';
import LayoutContext from './context.ts';

export default function ProjectLivePreviewClientLayout({
	preloadedProjectLivePreview,
	children,
}: PropsWithChildren<{
	preloadedProjectLivePreview: NonNullPreloaded<
		typeof api.v.ProjectLivePreview_get_dashboardPageData
	>;
}>) {
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { project } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);
	const { actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const [projectLivePreview] = usePreloadedQueryState(
		preloadedProjectLivePreview,
	);
	const [isClicked, setIsClicked] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (isClicked) {
			setTimeout(() => {
				setIsClicked(false);
			}, 1000);
		}
	}, [isClicked]);

	if (projectLivePreview === null) {
		router.push(`/${organization.slug}/projects/${project.slug}/previews`);
		return null;
	}

	const tunnelInstanceWebsiteHostname = getReleaseProjectLivePreviewUrl({
		withScheme: true,
		hostname: projectLivePreview.url,
	});

	return (
		<LayoutContext.Provider value={{ projectLivePreview }}>
			<HeaderContainer>
				<HeaderTitle
					actorOrganizationMember={actorOrganizationMember}
				>
					<div className="flex flex-row justify-center items-center gap-x-3">
						<Link
							className={buttonVariants({
								variant: 'outline',
								size: 'icon',
								className: 'gap-x-2',
							})}
							href={`/${organization.slug}/projects/${project.slug}/previews`}
						>
							<ArrowLeft size={14} />
						</Link>
						{projectLivePreview.url}
					</div>
				</HeaderTitle>

				<a
					className={cn(
						buttonVariants({ variant: 'outline', size: 'sm' }),
						'w-max',
					)}
					href={tunnelInstanceWebsiteHostname}
					target="_blank"
				>
					<ExternalLink size={16} />
				</a>
			</HeaderContainer>

			<DashboardContainer>{children}</DashboardContainer>
		</LayoutContext.Provider>
	);
}
