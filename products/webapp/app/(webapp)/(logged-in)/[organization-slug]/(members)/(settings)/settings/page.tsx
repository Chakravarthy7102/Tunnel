import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiOrganizationMember } from '#api-organization-member';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import OrganizationSettingsClientPage from './page.client.tsx';

export default async function OrganizationSettingsPage({
	params: { 'organization-slug': organizationSlug },
}: {
	params: {
		'organization-slug': string;
	};
}) {
	const actorUser = await WebappApiActor.from(getUser(), { include: {} });
	const organization = await WebappApiOrganization.getBySlugOrRedirect({
		slug: organizationSlug,
		actorUser,
		include: {},
	});
	const organizationMember = await WebappApiOrganizationMember.getOrRedirect({
		organization,
		actorUser,
		include: {},
	});

	if (organizationMember.role === 'guest') {
		return redirect(
			`/${organizationSlug}/settings/integrations`,
		);
	}

	if (organizationMember.role === 'member') {
		return redirect(
			`/${organizationSlug}/settings/people`,
		);
	}

	return <OrganizationSettingsClientPage />;
}
