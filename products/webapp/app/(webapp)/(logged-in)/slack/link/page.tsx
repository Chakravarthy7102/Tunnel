import { WebappApiActor } from '#api-actor';
import { getInclude } from '@-/database/selection-utils';
import {
	OrganizationMember_$actorProfileData,
} from '@-/database/selections';
import { getUser } from '@workos-inc/authkit-nextjs';
import { SlackLinkClientPage } from './page.client.tsx';

export default async function SlackLinkPage(
	{ searchParams }: { searchParams: { state?: string } },
) {
	const actorUser = await WebappApiActor.from(getUser(), {
		include: {
			organizationMemberships: {
				include: getInclude(OrganizationMember_$actorProfileData),
			},
		},
	});

	return (
		<SlackLinkClientPage
			actorUser={actorUser}
			state={searchParams.state ?? null}
		/>
	);
}
