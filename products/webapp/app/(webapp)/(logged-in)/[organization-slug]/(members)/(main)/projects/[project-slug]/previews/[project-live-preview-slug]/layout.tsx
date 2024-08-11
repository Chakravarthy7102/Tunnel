import { WebappApiActor } from '#api-actor';
import { WebappApiRedirect } from '#api-redirect';
import { isNonNullPreloaded } from '#utils/preload.ts';
import { ApiConvex } from '@-/convex/api';
import { getVapi } from '@-/database/vapi';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import OrganizationTunnelInstanceClientLayout from './layout.client.tsx';

export default async function ProjectLivePreviewLayout({
	children,
	params: {
		'project-live-preview-slug': projectLivePreviewSlug,
		'organization-slug': organizationSlug,
		'project-slug': projectSlug,
	},
}: PropsWithChildren<{
	params: {
		'project-live-preview-slug': string;
		'organization-slug': string;
		'project-slug': string;
	};
}>) {
	const vapi = await getVapi();
	const preloadedProjectLivePreview = await ApiConvex.preloadProtectedQuery(
		vapi.v.ProjectLivePreview_get_dashboardPageData,
		{ from: { slug: projectLivePreviewSlug } },
		{ token: null },
	);

	if (isNonNullPreloaded(preloadedProjectLivePreview)) {
		return (
			<OrganizationTunnelInstanceClientLayout
				preloadedProjectLivePreview={preloadedProjectLivePreview}
			>
				{children}
			</OrganizationTunnelInstanceClientLayout>
		);
	} else {
		const actorUser = await WebappApiActor.from(getUser(), {
			include: {},
		});
		return redirect(
			await WebappApiRedirect.getHomeRedirectPath({
				actorUser,
				organization: { slug: organizationSlug },
				project: { slug: projectSlug },
			}),
		);
	}
}
