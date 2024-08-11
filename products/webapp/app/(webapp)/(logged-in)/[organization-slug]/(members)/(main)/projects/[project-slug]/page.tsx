import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiProject } from '#api-project';
import { getSessionFromCookie } from '#utils/auth.ts';
import { ApiConvex } from '@-/convex/api';
import { getVapi } from '@-/database/vapi';
import { emptyFiltersSelection } from '@-/project-comment-thread/constants';
import { getUser } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';
import ProjectClientPage from './page.client.tsx';

export default async function ProjectPage({
	params: {
		'project-slug': projectSlug,
		'organization-slug': organizationSlug,
	},
}: {
	params: { 'project-slug': string; 'organization-slug': string };
}) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const session = await getSessionFromCookie(cookies());
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		actorUser,
		slug: organizationSlug,
		include: {},
	});
	const project = await WebappApiProject.getBySlugOrRedirect({
		actorUser,
		organization,
		slug: projectSlug,
		include: {},
	});

	const vapi = await getVapi();
	const preloadedProjectCommentThreads = await ApiConvex.preloadProtectedQuery(
		vapi.v.ProjectCommentThread_list_dashboardPageData,
		{
			where: {
				project: project._id,
				filtersSelection: {
					...emptyFiltersSelection,
					oneOfStatus: ['unresolved'],
				},
			},
			paginationOpts: { cursor: null, numItems: 10 },
		},
		{ token: session.accessToken },
	);

	return (
		<ProjectClientPage
			preloadedProjectCommentThreads={preloadedProjectCommentThreads}
		/>
	);
}
