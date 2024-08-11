import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import AsanaClientPage from './page.client.tsx';

export default async function AsanaSettings({
	params: { 'organization-slug': organizationSlug },
}: {
	params: { 'organization-slug': string };
}) {
	const actorUser = await WebappApiActor.from(getUser(), {
		include: {},
	});
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		actorUser,
		slug: organizationSlug,
		include: {
			asanaOrganization: true,
		},
	});

	if (!organization.asanaOrganization) {
		return redirect(`/${organizationSlug}/settings/integrations`);
	}

	return <AsanaClientPage />;
}
