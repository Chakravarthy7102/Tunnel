import { WebappApiActor } from '#api-actor';
import { WebappApiOrganization } from '#api-organization';
import { WebappApiOrganizationMember } from '#api-organization-member';
import { getUser } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import PageClient from './page.client.tsx';

export default async function Page({
	params: {
		'project-slug': projectSlug,
		'organization-slug': organizationSlug,
	},
}: {
	params: { 'project-slug': string; 'organization-slug': string };
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

	if (
		organizationMember.role === 'guest' || organizationMember.role === 'member'
	) {
		return redirect(`/${organizationSlug}/projects/${projectSlug}`);
	}

	return <PageClient />;
}
