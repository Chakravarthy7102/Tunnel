import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiOrganizationMember } from '#api-organization-member';
import { WebappApiRedirect } from '#api-redirect';
import { isNonNullPreloaded } from '#utils/preload.ts';
import { ApiConvex } from '@-/convex/api';
import { getVapi } from '@-/database/vapi';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import ProjectClientLayout from './layout.client.tsx';

export default async function ProjectLayout({
	children,
	params: {
		'project-slug': projectSlug,
		'organization-slug': organizationSlug,
	},
}: PropsWithChildren<{
	params: {
		'project-slug': string;
		'organization-slug': string;
	};
}>) {
	// Make sure that the actor has permission to view this project (i.e. if they're an organization member guest, make sure they have an authorizedProjectRelation to this project)
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		actorUser,
		slug: organizationSlug,
		include: {},
	});
	const organizationMember = await WebappApiOrganizationMember.getOrRedirect({
		actorUser,
		organization,
		include: {
			authorizedProjectRelations: {
				include: {
					project: true,
				},
			},
		},
	});

	if (
		organizationMember.role === 'guest' &&
		!organizationMember.authorizedProjectRelations.some((relation) =>
			relation.project.slug === projectSlug
		)
	) {
		return redirect(
			await WebappApiRedirect.getHomeRedirectPath({ actorUser, organization }),
		);
	}

	const vapi = await getVapi();
	const preloadedProject = await ApiConvex.preloadProtectedQuery(
		vapi.v.Project_get_dashboardPageData,
		{ from: { slug: projectSlug } },
		{ token: null },
	);

	if (isNonNullPreloaded(preloadedProject)) {
		return (
			<ProjectClientLayout preloadedProject={preloadedProject}>
				{children}
			</ProjectClientLayout>
		);
	} else {
		const actorUser = await WebappApiActor.from(getUser(), {
			include: {},
		});
		const organization = await WebappApiOrganization.getBySlugOrRedirect({
			actorUser,
			slug: organizationSlug,
			include: {},
		});
		return redirect(
			await WebappApiRedirect.getHomeRedirectPath({ actorUser, organization }),
		);
	}
}
