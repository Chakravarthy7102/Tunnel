import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiOrganizationMember } from '#api-organization-member';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import GithubSettingsClientPage from './page.client.tsx';

export default async function GithubSettings({
	params: { 'organization-slug': organizationSlug },
}: {
	params: { 'organization-slug': string };
}) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		actorUser,
		slug: organizationSlug,
		include: {},
	});

	const organizationMember = await WebappApiOrganizationMember.getOrRedirect({
		actorUser,
		organization,
		include: {},
	});

	if (organizationMember.role === 'guest') {
		return redirect(
			`/${organizationSlug}/settings/integrations`,
		);
	}

	if (!organization.githubOrganization) {
		return redirect(
			`/${organizationSlug}/settings/integrations`,
		);
	}

	return <GithubSettingsClientPage />;
}
