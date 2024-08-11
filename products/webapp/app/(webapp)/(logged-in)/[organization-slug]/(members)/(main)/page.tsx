import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiOrganizationMember } from '#api-organization-member';
import { getSessionFromCookie } from '#utils/auth.ts';
import { ApiConvex } from '@-/convex/api';
import { getVapi } from '@-/database/vapi';
import { emptyFiltersSelection } from '@-/project-comment-thread/constants';
import { getUser } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';
import OrganizationCommentsClientPage from './page.client.tsx';

export default async function OrganizationCommentsPage({
	params: { 'organization-slug': organizationSlug },
}: {
	params: {
		'organization-slug': string;
	};
}) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const session = await getSessionFromCookie(cookies());
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		slug: organizationSlug,
		actorUser,
		include: {},
	});
	const organizationMember = await WebappApiOrganizationMember.getOrRedirect({
		organization,
		actorUser,
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
				organizationMember: organizationMember._id,
			},
		},
		{ token: session.accessToken },
	);

	return (
		<OrganizationCommentsClientPage
			preloadedCommentThreads={preloadedCommentThreads}
		/>
	);
}
