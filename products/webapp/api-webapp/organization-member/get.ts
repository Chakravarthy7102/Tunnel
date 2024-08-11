import { WebappApiRedirect } from '#api-redirect';
import { ApiConvex } from '@-/convex/api';
import type { SelectInput, ServerDoc } from '@-/database';
import { redirect } from 'next/navigation';

export async function WebappApiOrganizationMember_getOrRedirect<
	$Include extends SelectInput<'OrganizationMember'>,
>({
	actorUser,
	organization,
	include,
}: {
	actorUser: ServerDoc<'User'>;
	organization: ServerDoc<'Organization'>;
	include: $Include;
}) {
	const organizationMember = await ApiConvex.v.OrganizationMember.get({
		from: {
			organization: organization._id,
			user: actorUser._id,
		},
		include,
	}).unwrapOrThrow();

	if (organizationMember === null) {
		return redirect(
			await WebappApiRedirect.getHomeRedirectPath({ actorUser, organization }),
		);
	} else {
		return organizationMember;
	}
}
