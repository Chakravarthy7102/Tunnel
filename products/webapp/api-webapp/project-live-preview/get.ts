import { WebappApiRedirect } from '#api-redirect';
import { ApiConvex } from '@-/convex/api';
import type { SelectInput, ServerDoc } from '@-/database';
import { redirect } from 'next/navigation';

export async function WebappApiProjectLivePreview_getBySlugOrRedirect<
	$Include extends SelectInput<'Project'>,
>({
	actorUser,
	organization,
	project,
	slug,
	include,
}: {
	actorUser: ServerDoc<'User'>;
	organization: { slug: string };
	project: { slug: string };
	slug: string;
	include: $Include;
}) {
	const projectLivePreview = await ApiConvex.v.ProjectLivePreview.get({
		from: { slug },
		include,
	}).unwrapOrThrow();

	if (projectLivePreview === null) {
		return redirect(
			await WebappApiRedirect.getHomeRedirectPath({
				actorUser,
				organization,
				project,
			}),
		);
	} else {
		return projectLivePreview;
	}
}
