import { WebappApiRedirect } from '#api-redirect';
import { ApiConvex } from '@-/convex/api';
import type { SelectInput, ServerDoc } from '@-/database';
import { redirect } from 'next/navigation';

export async function WebappApiOrganization_getBySlugOrRedirect<
	$Include extends SelectInput<'Organization'>,
>({
	actorUser,
	slug,
	include,
}: {
	actorUser: ServerDoc<'User'>;
	slug: string;
	include: $Include;
}) {
	const organization = await ApiConvex.v.Organization.get({
		from: { slug },
		include,
	}).unwrapOrThrow();

	if (organization === null) {
		return redirect(await WebappApiRedirect.getHomeRedirectPath({ actorUser }));
	} else {
		return organization;
	}
}
