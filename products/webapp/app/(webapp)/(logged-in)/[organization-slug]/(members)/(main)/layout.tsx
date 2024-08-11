import { WebappApiActor } from '#api-actor';
import { WebappApiRedirect } from '#api-redirect';
import { isFeatureEnabled } from '#utils/feature.ts';
import { isNonNullPreloaded } from '#utils/preload.ts';
import { ApiConvex } from '@-/convex/api';
import { preloadedQueryResult } from '@-/convex/nextjs';
import { getVapi } from '@-/database/vapi';
import { organizationSlugSchema } from '@-/organization/schemas';
import { getUser } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { MainSidebar } from '../main-sidebar.tsx';
import { SideMenu } from '../side-menu.tsx';

export default async function Layout({
	params: { 'organization-slug': organizationSlug },
	children,
}: React.PropsWithChildren<{
	params: { 'organization-slug': string };
}>) {
	if (!organizationSlugSchema.safeParse(organizationSlug).success) {
		return redirect('/home');
	}

	const actorUser = await WebappApiActor.from(getUser(), {
		include: {},
	});
	const vapi = await getVapi();
	const preloadedOrganization = await ApiConvex.preloadProtectedQuery(
		vapi.v.Organization_get_dashboardPageData,
		{ from: { slug: organizationSlug } },
		{ token: null },
	);

	if (isNonNullPreloaded(preloadedOrganization)) {
		const organization = preloadedQueryResult(preloadedOrganization);
		const preloadedActorOrganizationMember = await ApiConvex
			.preloadProtectedQuery(
				vapi.v.OrganizationMember_get_actorProfileData,
				{
					from: {
						organization: organization._id,
						user: actorUser._id,
					},
				},
				{ token: null },
			);

		if (isNonNullPreloaded(preloadedActorOrganizationMember)) {
			const showV2 = await isFeatureEnabled('ui-v2', {
				cookies: cookies(),
				actorUser,
			});

			return (
				<div className="h-screen flex flex-col gap-2 bg-background text-foreground flex-1 min-h-screen max-h-screen items-center w-full">
					<div className="w-full h-full flex flex-row justify-start items-start">
						{showV2 ?
							(
								<MainSidebar
									preloadedActorOrganizationMember={preloadedActorOrganizationMember}
								/>
							) :
							(
								<SideMenu
									actorOrganizationMember={preloadedActorOrganizationMember}
								/>
							)}
						<div className="w-full h-full flex flex-col justify-start items-start bg-background overflow-x-auto">
							{children}
						</div>
					</div>
				</div>
			);
		}
	}

	// Organization doesn't exist or the user is not a member of the organization
	return redirect(
		await WebappApiRedirect.getHomeRedirectPath({ actorUser }),
	);
}
