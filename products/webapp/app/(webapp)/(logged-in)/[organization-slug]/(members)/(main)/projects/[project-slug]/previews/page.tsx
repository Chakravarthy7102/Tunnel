import { WebappApiActor } from '#api-actor';
import { WebappApiProject } from '#api-project';
import { ApiConvex } from '@-/convex/api';
import { getInclude } from '@-/database/selection-utils';
import {
	ProjectLivePreview_$linkData,
} from '@-/database/selections';
import { getVapi } from '@-/database/vapi';
import { getUser } from '@workos-inc/authkit-nextjs';
import ProjectLivePreviewsClientPage from './page.client.tsx';

export default async function ProjectLivePreviewsPage({
	params: {
		'project-slug': projectSlug,
		'organization-slug': organizationSlug,
	},
}: {
	params: { 'project-slug': string; 'organization-slug': string };
}) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const projectData = await WebappApiProject.getBySlugOrRedirect({
		actorUser,
		organization: { slug: organizationSlug },
		slug: projectSlug,
		include: {
			organization: true,
		},
	});

	const { organization, ...project } = projectData;

	const vapi = await getVapi();
	const preloadedProjectLivePreviews = await ApiConvex
		.preloadProtectedQuery(
			vapi.v.ProjectLivePreview_list,
			{
				include: getInclude(ProjectLivePreview_$linkData),
				where: {
					inProject: project._id,
				},
			},
			{ token: null },
		);

	return (
		<ProjectLivePreviewsClientPage
			preloadedProjectLivePreviews={preloadedProjectLivePreviews}
			organization={organization}
			project={project}
		/>
	);
}
