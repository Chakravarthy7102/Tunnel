'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { useRouteContext } from '#utils/route-context.ts';
import { trpcClient } from '#utils/trpc.ts';
import { Button, buttonVariants } from '@-/design-system/v1';
import { useState } from 'react';

export function OrganizationBillingCard() {
	const [isLoading, setIsLoading] = useState(false);
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	return (
		<DashboardCard
			title={organization.subscriptionPlan === 'free' ?
				'Pick a plan' :
				'Manage your plan'}
			button={
				<div className="w-full flex flex-row justify-between items-center">
					<p className="text-sm font-normal text-muted-foreground">
						Have any questions?
					</p>
					<a
						className={buttonVariants({
							variant: 'outline',
						})}
						href="mailto:support@tunnel.dev"
					>
						Get in touch
					</a>
				</div>
			}
		>
			<div className="flex flex-row justify-center items-center mb-3 gap-x-2">
				<p className="font-normal text-4xl">$16</p>
				<p className="text-muted-foreground">/ seat / month</p>
			</div>

			<Button
				variant={organization.subscriptionPlan === 'free' ? 'blue' : 'outline'}
				size={'lg'}
				isLoading={isLoading}
				onClick={async () => {
					setIsLoading(true);
					if (organization.subscriptionPlan === 'free') {
						try {
							const { checkoutSessionUrl } = (await trpcClient.billing.checkout
								.query({
									actor: { type: 'User', data: { id: actorUser._id } },
									organization: {
										id: organization._id,
									},
									redirectUrl: window.location.href,
								})).unwrapOrThrow();

							if (checkoutSessionUrl) window.location.href = checkoutSessionUrl;
						} finally {
							setIsLoading(false);
						}
					} else {
						setIsLoading(true);
						try {
							const { portalSessionUrl } = (await trpcClient.billing.manage
								.query({
									actor: { type: 'User', data: { id: actorUser._id } },
									organization: {
										id: organization._id,
									},
									redirectUrl: window.location.href,
								})).unwrapOrThrow();

							if (portalSessionUrl) window.location.href = portalSessionUrl;
						} finally {
							setIsLoading(false);
						}
					}
				}}
			>
				{organization.subscriptionPlan === 'free' ? 'Upgrade' : 'Manage'}
			</Button>
		</DashboardCard>
	);
}

// <DialogContent container={documentBody}>
// 	<DialogTitle>
// 		{organization.subscriptionPlan === 'free'
// 			? 'Pick a plan'
// 			: 'Manage your plan'}
// 	</DialogTitle>
// 	<div className="w-full flex flex-row justify-center items-start gap-x-8 py-3">
// 		{organization.subscriptionPlan === 'free' && (
// 			<Plan
// 				planType="Free"
// 				price="$0"
// 				buttonText="Current plan"
// 				buttonProps={{
// 					variant: 'default',
// 					disabled: true,
// 					className: 'w-full',
// 					size: 'lg'
// 				}}
// 				featureSubtitle="Includes"
// 				features={['1 project', '3 tunnels', '3 collaborators']}
// 			/>
// 		)}
// 		<Plan
// 			planType="Team"
// 			price="$16"
// 			buttonText={
// 				organization.subscriptionPlan === 'team'
// 					? 'Manage subscription'
// 					: 'Upgrade to team'
// 			}
// 			buttonProps={{
// 				variant: organization.subscriptionPlan === 'free' ? 'brand' : 'outline',
// 				className: 'w-full',
// 				size: 'lg',
// 				isLoading: isLoading,
// 				onClick: async () => {
// 					setIsLoading(true);
// 					if (organization.subscriptionPlan === 'free') {
// 						try {
// 							const { checkoutSessionUrl } =
// 								await trpcClient.billing.checkout.query({
// 									actor: {
// 										user: {
// 											userId: actorUser._id
// 										}
// 									},
// 									organization: {
// 										id: organization._id
// 									},
// 									redirectUrl: window.location.href
// 								});

// 							if (checkoutSessionUrl) window.location.href = checkoutSessionUrl;
// 						} catch (error) {
// 							logger.error(error);
// 						} finally {
// 							setIsLoading(false);
// 						}
// 					} else {
// 						setIsLoading(true);
// 						try {
// 							const { portalSessionUrl } =
// 								await trpcClient.billing.manage.query({
// 									actor: {
// 										user: {
// 											userId: actorUser._id
// 										}
// 									},
// 									organization: {
// 										id: organization._id
// 									},
// 									redirectUrl: window.location.href
// 								});

// 							if (portalSessionUrl) window.location.href = portalSessionUrl;
// 						} catch (error) {
// 							logger.error(error);
// 						} finally {
// 							setIsLoading(false);
// 						}
// 					}
// 				}
// 			}}
// 			featureSubtitle="Includes"
// 			features={[
// 				'Unlimited projects',
// 				'Unlimited tunnels',
// 				'Unlimited collaborators'
// 			]}
// 		/>
// 	</div>
// </DialogContent>;
