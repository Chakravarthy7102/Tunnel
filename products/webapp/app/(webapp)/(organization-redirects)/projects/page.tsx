import { WebappApiActor } from '#api-actor';
import { WebappApiRedirect } from '#api-redirect';
import { getUser } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';

export default async function RedirectToProjects() {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	return WebappApiRedirect.redirectToOrganizationPage({
		actorUser,
		cookies: cookies(),
		to: '/projects',
	});
}
