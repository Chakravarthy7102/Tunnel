import { WebappApiRedirect } from '#api-redirect';
import { ApiConvex } from '@-/convex/api';
import type { SelectInput, ServerDoc } from '@-/database';
import { redirect } from 'next/navigation';

export async function WebappApiProject_getBySlugOrRedirect<
	$Include extends SelectInput<'Project'>,
>({
	slug,
	actorUser,
	organization,
	include,
}: {
	actorUser: ServerDoc<'User'>;
	organization: { slug: string };
	slug: string;
	include: $Include;
}) {
	const project = await ApiConvex.v.Project.get({
		from: { slug },
		include,
	}).unwrapOrThrow();

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
	if (project === null) {
		return redirect(
			await WebappApiRedirect.getHomeRedirectPath({ actorUser, organization }),
		);
	} else {
		return project;
	}
}
