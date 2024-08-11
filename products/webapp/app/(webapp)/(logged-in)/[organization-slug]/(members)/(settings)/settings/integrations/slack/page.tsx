import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import SlackClientPage from './page.client.tsx';

export default async function SlackOrganizationSettings({
	params: { 'organization-slug': organizationSlug },
}: React.PropsWithChildren<{
	params: { 'organization-slug': string };
}>) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		actorUser,
		slug: organizationSlug,
		include: { slackOrganization: true },
	});

	if (!organization.slackOrganization) {
		return redirect(
			`/${organizationSlug}/settings/integrations`,
		);
	}

	return <SlackClientPage />;
}
