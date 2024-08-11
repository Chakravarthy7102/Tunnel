'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { PersonalAccountCard } from '#components/v1/cards/personal-account-card.tsx';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import type { ServerDoc } from '@-/database';
import type { OrganizationMember_$actorProfileData } from '@-/database/selections';
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@-/design-system/v1';
import {
	getLinearAuthUrl,
} from '@-/integrations';

import { toast } from '@-/tunnel-error';
import {
	ChevronDown,
	LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LinearClientPage() {
	const { organization, actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	if (!organization.linearOrganization) {
		return null;
	}

	return (
		<>
			<ConnectPersonalLinearAccountCard
				actorOrganizationMember={actorOrganizationMember}
			/>
			{actorOrganizationMember.role !== 'guest' &&
				actorOrganizationMember.role !== 'member' && (
				<>
					<RemoveLinearCard />
				</>
			)}
		</>
	);
}

function ConnectPersonalLinearAccountCard(
	{ actorOrganizationMember }: {
		actorOrganizationMember: ServerDoc<
			typeof OrganizationMember_$actorProfileData
		>;
	},
) {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');

	const documentBody = useDocumentBody();

	const deleteOrganizationMemberIntegration = trpc.organizationMemberIntegration
		.delete.useMutation();

	return (
		<PersonalAccountCard
			title={actorOrganizationMember.linkedLinearAccount ?
				'Personal account connected' :
				'Connect personal account'}
			subtitle={actorOrganizationMember.linkedLinearAccount ?
				'You have connected your Linear account to Tunnel' :
				'Connect your Linear account to use this integration'}
			button={actorOrganizationMember.linkedLinearAccount ?
				(
					<DropdownMenu>
						<DropdownMenuTrigger asChild className="w-full">
							<Button
								className="w-full text-muted-foreground justify-end flex focus-visible:ring-0"
								variant="none"
								size="minimal"
							>
								<p className="text-sm font-medium flex items-center">
									{actorOrganizationMember.linkedLinearAccount.linearEmail}
									<ChevronDown className="ml-2" size={16} />
								</p>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" container={documentBody}>
							<DropdownMenuItem
								onClick={async () => {
									(await deleteOrganizationMemberIntegration.mutateAsync({
										actor: {
											type: 'User',
											data: { id: actorUser._id },
										},
										organizationMember: {
											id: actorOrganizationMember._id,
										},
										type: 'OrganizationMemberLinearAccount',
									})).unwrapOrThrow();
								}}
								danger
							>
								<LogOut size={14} />
								Disconnect
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) :
				(
					<Button asChild variant="outline">
						<a
							href={getLinearAuthUrl({
								isPersonalConnection: true,
								organizationMemberId: actorOrganizationMember._id,
								redirectPath: null,
							})}
							className="flex items-center"
						>
							Connect
						</a>
					</Button>
				)}
		/>
	);
}

function RemoveLinearCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization, setOrganization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	const router = useRouter();
	const mutateUpdateOrganization = trpc.organization.update.useMutation();

	const [isLoading, setIsLoading] = useState<boolean>(false);

	return (
		<DashboardCard
			title="Remove Linear connection"
			subtitle="Are you sure you want to remove your Linear connection?"
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
									linearOrganization: null,
								},
							},
						);

						setIsLoading(false);
						if (result.isErr()) {
							toast.procedureError(result);
						}

						setOrganization({
							...organization,
							linearOrganization: null,
						});
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
