'use client';

import { OrganizationList } from '#components/v1/organization-list.tsx';
import { addQueryParams } from '#utils/query-params.ts';
import type {
	GetInclude,
	Selection,
	ServerDoc,
} from '@-/database';
import type { OrganizationMember_$actorProfileData } from '@-/database/selections';
import { SlackIcon, TunnelIcon } from '@-/integrations/components';
import { ArrowLeftRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SlackLinkPageComponent from './link-page.tsx';

export function SlackLinkClientPage(
	{ actorUser, state }: {
		state: string | null;
		actorUser: ServerDoc<
			Selection<'User', {
				organizationMemberships: {
					include: GetInclude<typeof OrganizationMember_$actorProfileData>;
				};
			}>
		>;
	},
) {
	const router = useRouter();
	const organizations = actorUser.organizationMemberships.map((membership) =>
		membership.organization
	);

	const [organization, setOrganization] = useState(organizations[0]);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- it exists
	const actorOrganizationMember = actorUser.organizationMemberships.find(
		(membership) => membership.organization._id === organization?._id,
	)!;

	useEffect(() => {
		if (organization) {
			addQueryParams({ param: 'organization', value: organization._id });
		}
	}, [organization]);

	if (organizations[0] === undefined) {
		void router.push('/welcome');
		return null;
	}

	return (
		<div className="flex relative flex-col justify-center items-center w-full h-screen bg-background p-8">
			<div className="absolute top-0 left-0 p-8">
				<a href="/home" target="_blank">
					<img
						src="/assets/images/light-full-transparent.svg"
						className="h-8"
					/>
				</a>
			</div>
			<div className="absolute top-0 right-0 p-8 text-sm">
				<OrganizationList
					organization={organization}
					setOrganization={setOrganization}
					organizations={organizations}
				/>
			</div>

			<div className="flex flex-col justify-center items-center md:p-6 rounded-md w-full max-w-md">
				<div className="flex flex-row justify-center items-center gap-x-2 mb-4">
					<SlackIcon
						variant={'rounded'}
						size={'lg'}
					/>
					<ArrowLeftRight size={24} className="text-blue-600" />
					<TunnelIcon
						variant={'rounded'}
						size={'lg'}
						className="border border-solid border-input"
					/>
				</div>

				<h1 className="text-xl text-foreground font-medium mb-1 text-center">
					Connect Slack to Tunnel
				</h1>
				<p className="text-muted-foreground w-full px-4 text-center">
					Please authorize Tunnel to connect to your Slack account below.
				</p>

				<SlackLinkPageComponent
					state={state}
					actorUser={actorUser}
					actorOrganizationMember={actorOrganizationMember}
				/>
			</div>
		</div>
	);
}
