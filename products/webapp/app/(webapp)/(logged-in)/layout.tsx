import { WebappApiActor } from '#api-actor';
import { WebappApiRedirect } from '#api-redirect';
import { isNonNullPreloaded } from '#utils/preload.ts';
import { ApiConvex } from '@-/convex/api';
import { getVapi } from '@-/database/vapi';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import LoggedInClientLayout from './layout.client.tsx';

export default async function LoggedInLayout({
	children,
}: React.PropsWithChildren) {
	const actorUser = await WebappApiActor.from(getUser(), {
		include: {},
	});

	const vapi = await getVapi();
	const preloadedActorUser = await ApiConvex.preloadProtectedQuery(
		vapi.v.User_get_profileData,
		{ from: { id: actorUser._id } },
		{ token: null },
	);

	const preloadedActorOrganizationMembers = await ApiConvex
		.preloadProtectedQuery(
			vapi.v.OrganizationMember_list_actorProfileData,
			{
				where: {
					user: actorUser._id,
					includeProjectGuests: true,
				},
				paginationOpts: {
					cursor: null,
					numItems: 100,
				},
			},
			{ token: null },
		);

	if (isNonNullPreloaded(preloadedActorUser)) {
		return (
			<LoggedInClientLayout
				preloadedActorUser={preloadedActorUser}
				preloadedActorOrganizationMembers={preloadedActorOrganizationMembers}
			>
				{children}
			</LoggedInClientLayout>
		);
	} else {
		return redirect(await WebappApiRedirect.getHomeRedirectPath({ actorUser }));
	}
}
