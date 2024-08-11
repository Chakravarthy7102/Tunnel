import { WebappApiActor } from '#api-actor';
import { ApiConvex } from '@-/convex/api';
import { getInclude } from '@-/database/selection-utils';
import {
	OrganizationInvitation_$dashboardPageData,
} from '@-/database/selections';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import JoinClientPage from './page.client.tsx';

export default async function JoinPage() {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const { page: organizationInvitations } = await ApiConvex.v
		.OrganizationInvitation
		.list({
			where: {
				user: actorUser._id,
			},
			include: getInclude(OrganizationInvitation_$dashboardPageData),
			paginationOpts: {
				cursor: null,
				numItems: 100,
			},
		}).unwrapOrThrow();

	const filteredOrganizationInvitations = organizationInvitations.filter(
		(invitation) => invitation.status === 'pending',
	);

	if (filteredOrganizationInvitations.length === 0) {
		return redirect('/welcome');
	}

	return (
		<JoinClientPage
			organizationInvitations={filteredOrganizationInvitations}
		/>
	);
}
