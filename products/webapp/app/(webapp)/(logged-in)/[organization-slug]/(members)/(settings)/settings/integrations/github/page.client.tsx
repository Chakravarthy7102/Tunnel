'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { Button } from '@-/design-system/v1';
import { toast } from '@-/tunnel-error';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GithubSettingsClient() {
	return <RemoveGithubCard />;
}

function RemoveGithubCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	const mutateUpdateOrganization = trpc.organization.update.useMutation();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const router = useRouter();

	return (
		<DashboardCard
			title="Remove GitHub connection"
			subtitle="Are you sure you want to remove your GitHub connection?"
			isDanger
			button={
				<Button
					isLoading={isLoading}
					variant="destructive"
					onClick={async () => {
						setIsLoading(true);
						const result = await mutateUpdateOrganization.mutateAsync(
							{
								actor: {
									type: 'User',
									data: { id: actorUser._id },
								},
								organization: {
									id: organization._id,
								},
								updates: {
									githubOrganization: null,
								},
							},
						);

						setIsLoading(false);
						if (result.isErr()) {
							toast.procedureError(result);
							return;
						}

						router.push(`/${organization.slug}/settings/integrations`);
					}}
				>
					Remove
				</Button>
			}
		>
		</DashboardCard>
	);
}
