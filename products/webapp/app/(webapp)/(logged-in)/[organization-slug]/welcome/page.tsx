import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiOrganizationMember } from '#api-organization-member';
import { ApiConvex } from '@-/convex/api';
import { getInclude } from '@-/database/selection-utils';
import {
	Organization_$dashboardPageData,
	OrganizationMember_$dashboardPageData,
	Project_$dashboardPageData,
} from '@-/database/selections';
import { getUser } from '@workos-inc/authkit-nextjs';
import WelcomeClientPage from './page.client.tsx';

export default async function WelcomePage({
	params: { 'organization-slug': organizationSlug },
}: {
	params: {
		'organization-slug': string;
	};
}) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		actorUser,
		slug: organizationSlug,
		include: getInclude(Organization_$dashboardPageData),
	});
	const actorOrganizationMember = await WebappApiOrganizationMember
		.getOrRedirect(
			{
				actorUser,
				organization,
				include: getInclude(OrganizationMember_$dashboardPageData),
			},
		);
	const { page: projects } = await ApiConvex.v.Project.list({
		where: {
			organizationMember: actorOrganizationMember._id,
		},
		include: getInclude(Project_$dashboardPageData),
		paginationOpts: {
			cursor: null,
			numItems: 1,
		},
	}).unwrapOrThrow();

	return (
		<WelcomeClientPage
			actorOrganizationMember={actorOrganizationMember}
			organization={organization}
			project={projects[0] ?? null}
		/>
	);
}
