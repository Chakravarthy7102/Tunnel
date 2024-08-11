'use client';

import { MuratCard } from '#app/(webapp)/(logged-in)/[organization-slug]/welcome/components/murat-card.tsx';
import type { StepScreenProps } from '#types';
import { DISCORD_URL } from '#utils/constants.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { Button, buttonVariants, cn } from '@-/design-system/v1';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ConnectStepScreen({ organization }: StepScreenProps) {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const mutateUpdateOrganization = trpc.organization.update.useMutation();

	const SocialRow = ({
		description,
		title,
		link,
		linkText,
	}: {
		description: string;
		title: string;
		link: string;
		linkText: string;
	}) => (
		<div className="w-full p-4 gap-x-4 flex flex-row justify-between items-center border-b border-b-solid border-b-[#ffffff10] last:border-none">
			<div className="flex flex-col justify-center items-start">
				<p className="text-left text-foreground text-base font-medium text-neutral-0">
					{title}
				</p>
				<p className="text-left text-sm text-neutral-400">
					{description}
				</p>
			</div>

			<a
				href={link}
				target="_blank"
				className={cn(buttonVariants({ variant: 'muratsecondary' }))}
			>
				{linkText}
			</a>
		</div>
	);

	return (
		<div className="flex flex-col justify-center items-center gap-y-6">
			<div className="flex flex-col justify-center items-center text-center">
				<h1 className="text-2xl font-medium text-center text-neutral-0">
					Stay connected!
				</h1>
				<p className="text-base text-neutral-400 max-w-md text-center">
					We're always working to improve your experience. Here are the best
					ways to stay in the loop.
				</p>
			</div>

			<MuratCard className="flex flex-col justify-center items-start w-full max-w-md">
				<SocialRow
					title="Follow us on Twitter"
					description="Tweets about features and updates"
					link="https://x.com/TunnelHQ"
					linkText="@TunnelHQ"
				/>
				<SocialRow
					title="Join the Discord"
					description="Receive support and join the community"
					link={DISCORD_URL}
					linkText="Join Discord"
				/>
			</MuratCard>
			<Button
				variant="muratblue"
				size="muratsm"
				className="w-full"
				isLoading={isLoading}
				onClick={async () => {
					setIsLoading(true);
					const result = await mutateUpdateOrganization.mutateAsync(
						{
							actor: { type: 'User', data: { id: actorUser._id } },
							organization: {
								id: organization._id,
							},
							updates: {
								isOnboarded: true,
							},
						},
					);
					if (result.isOk()) {
						router.push(`/${organization.slug}/get-started`);
					} else {
						setIsLoading(false);
					}
				}}
			>
				Open Tunnel
			</Button>
		</div>
	);
}
