'use client';

import { ProjectLivePreviewLinks } from '#components/v1/project-live-preview-links.tsx';
import { usePreloadedQueryState } from '#hooks/preload.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { type Preloaded } from '@-/convex/react';
import type { api, ServerDoc } from '@-/database';
import type { ProjectLivePreview_$linkData } from '@-/database/selections';

export default function ProjectLivePreviewsClientPage({
	preloadedProjectLivePreviews,
	organization,
	project,
}: {
	organization: ServerDoc<'Organization'>;
	project: ServerDoc<'Project'>;
	preloadedProjectLivePreviews: Preloaded<
		typeof api.v.ProjectLivePreview_list
	>;
}) {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const [projectLivePreviews] = usePreloadedQueryState(
		preloadedProjectLivePreviews,
	) as [
		Array<ServerDoc<typeof ProjectLivePreview_$linkData>>,
		any,
	];

	return (
		<ProjectLivePreviewLinks
			organization={organization}
			project={project}
			projectLivePreviews={projectLivePreviews}
			actorUser={actorUser}
		/>
	);
}
