import { WebappApiActor } from '#api-actor';
import { WebappApiRedirect } from '#api-redirect';
import { organizationInvitationSelect } from '#app/(webapp)/(logged-in)/join/select.ts';
import { ApiConvex } from '@-/convex/api';
import { getInclude } from '@-/database/selection-utils';
import { clientNextQueryHandlers } from '@-/next-query-handlers/client';
import { ApiUrl } from '@-/url/api';
import { getUser } from '@workos-inc/authkit-nextjs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import JoinClient from './page.client.tsx';

export default async function JoinPage({
	params: { 'invitation-id': invitationId },
}: {
	params: { 'invitation-id': string };
}) {
	const actorUser = await WebappApiActor.from(getUser(), {
		include: {},
		redirectOnNull: false,
	});

	if (actorUser === null) {
		return redirect(
			clientNextQueryHandlers
				.redirectOnAuthenticatedAsUser.appendNextToUrl(
					'/login',
					{
						redirectUrl: ApiUrl.getWebappUrl({
							withScheme: true,
							path: `/join/${invitationId}`,
							fromHeaders: headers(),
						}),
					},
				),
		);
	}

	const organizationInvitation = await ApiConvex.v.OrganizationInvitation.get({
		from: { id: invitationId },
		include: getInclude(organizationInvitationSelect),
	}).unwrapOrThrow();

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
	if (organizationInvitation === null) {
		return redirect(await WebappApiRedirect.getHomeRedirectPath({ actorUser }));
	}

	if (organizationInvitation.status !== 'pending') {
		return redirect(await WebappApiRedirect.getHomeRedirectPath({ actorUser }));
	}

	// We need to ensure that the invitation matches the user's email
	if (
		// dprint-ignore
		(
			organizationInvitation.recipientUser !== null &&
			organizationInvitation.recipientUser._id !== actorUser._id
		) || (
			organizationInvitation.recipientEmailAddress !== null &&
			organizationInvitation.recipientEmailAddress !== actorUser.email
		)
	) {
		// TODO: redirect to a special page
		return redirect(await WebappApiRedirect.getHomeRedirectPath({ actorUser }));
	}

	return (
		<JoinClient
			organizationInvitation={organizationInvitation}
		/>
	);
}
