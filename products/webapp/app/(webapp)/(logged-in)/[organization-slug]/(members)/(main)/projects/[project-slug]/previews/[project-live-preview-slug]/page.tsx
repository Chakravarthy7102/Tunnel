import { WebappApiActor } from '#api-actor';
import { WebappApiProjectLivePreview } from '#api-project-live-preview';
import { getSessionFromCookie } from '#utils/auth.ts';
import { ApiConvex } from '@-/convex/api';
import { getVapi } from '@-/database/vapi';
import { emptyFiltersSelection } from '@-/project-comment-thread/constants';
import { getUser } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';
import ProjectLivePreviewClientPage from './page.client.tsx';

export default async function ProjectLivePreviewPage({
	params: {
		'project-live-preview-slug': projectLivePreviewSlug,
		'organization-slug': organizationSlug,
		'project-slug': projectSlug,
	},
}: {
	params: {
		'project-live-preview-slug': string;
		'organization-slug': string;
		'project-slug': string;
	};
}) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const session = await getSessionFromCookie(cookies());
	const projectLivePreview = await WebappApiProjectLivePreview
		.getBySlugOrRedirect({
			actorUser,
			organization: { slug: organizationSlug },
			project: { slug: projectSlug },
			slug: projectLivePreviewSlug,
			include: {},
		});

	const vapi = await getVapi();
	const preloadedCommentThreads = await ApiConvex.preloadProtectedQuery(
		vapi.v.ProjectCommentThread_list_dashboardPageData,
		{
			paginationOpts: {
				cursor: null,
				numItems: 10,
			},
			where: {
				filtersSelection: {
					...emptyFiltersSelection,
					oneOfStatus: ['unresolved'],
				},
				linkedProjectLivePreview: projectLivePreview._id,
			},
		},
		{ token: session.accessToken },
	);

	return (
		<ProjectLivePreviewClientPage
			preloadedCommentThreads={preloadedCommentThreads}
		/>
	);
}
