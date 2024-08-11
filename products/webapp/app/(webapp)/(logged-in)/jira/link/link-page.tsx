'use client';

import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type {
	Organization_$memberProfileData,
	User_$profileData,
} from '@-/database/selections';
import { Button } from '@-/design-system/v1';
import { useRouter } from 'next/navigation';

export default function JiraLinkPageComponent({
	organization,
	actorUser,
	url,
}: {
	organization: ServerDoc<
		typeof Organization_$memberProfileData
	>;
	actorUser: ServerDoc<typeof User_$profileData>;
	url: string | null;
}) {
	const router = useRouter();
	const mutateUpdateOrganization = trpc.organization.update.useMutation();

	const connect = async () => {
		(await mutateUpdateOrganization.mutateAsync(
			{
				actor: { type: 'User', data: { id: actorUser._id } },
				organization: {
					id: organization._id,
				},
				updates: {
					// @ts-expect-error: todo
					jiraOrganization: {
						...organization.jiraOrganization ?? {
							url: null,
							default: null,
							createAutomatically: false,
						},
						webTriggerUrl: url,
					},
				},
			},
		)).unwrapOrThrow();

		void router.push(`/${organization.slug}/settings/integrations/jira`);
	};

	return (
		<Button className="mt-5" onClick={connect}>
			Continue with Tunnel
		</Button>
	);
}
