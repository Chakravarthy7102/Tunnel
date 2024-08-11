'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { PersonalAccountCard } from '#components/v1/cards/personal-account-card.tsx';
import { DashboardContainer } from '#components/v1/dashboard/layout/container.tsx';
import { SlackChannelCombobox } from '#components/v1/slack-channels-combobox.tsx';
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
import { getSlackAuthUrl, type SlackChannel } from '@-/integrations';
import { ComboboxRow, SlackIcon } from '@-/integrations/components';
import { toast } from '@-/tunnel-error';
import { ChevronDown, FolderKanban, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SlackClient() {
	const { actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	return (
		<DashboardContainer>
			<ConnectPersonalSlackAccountCard
				actorOrganizationMember={actorOrganizationMember}
			/>
			{actorOrganizationMember.role !== 'guest' &&
				actorOrganizationMember.role !== 'member' && (
				<>
					<SlackSettings />
					<RemoveSlackCard />
				</>
			)}
		</DashboardContainer>
	);
}

function ConnectPersonalSlackAccountCard(
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
			title={actorOrganizationMember.linkedSlackAccount ?
				'Personal account connected' :
				'Connect personal account'}
			subtitle={actorOrganizationMember.linkedSlackAccount ?
				'You have connected your Slack account to Tunnel' :
				'Connect your Slack account to use this integration'}
			button={actorOrganizationMember.linkedSlackAccount ?
				(
					<DropdownMenu>
						<DropdownMenuTrigger asChild className="w-full">
							<Button
								className="w-full text-muted-foreground justify-end flex focus-visible:ring-0"
								variant="none"
								size="minimal"
							>
								<p className="text-sm font-medium flex items-center">
									{actorOrganizationMember.linkedSlackAccount.slackEmail}
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
										type: 'OrganizationMemberSlackAccount',
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
							href={getSlackAuthUrl({
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

function SlackSettings() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { projects, setProjects, actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	const updateProject = trpc.project.update.useMutation();

	const response = trpc.slack.getChannels.useQuery({
		actor: {
			type: 'User',
			data: { id: actorUser._id },
		},
		organizationMember: {
			id: actorOrganizationMember._id,
		},
	});

	const { data, status } = response;
	const slackChannels =
		(data?.isOk() ? (data.value ?? []) : []) as SlackChannel[];

	return (
		<DashboardCard
			title="Slack broadcasts"
			isPadded={false}
			subtitle="Slack broadcasts send Slack messages alongside your Tunnel threads to keep your whole team updated"
			icon={<SlackIcon />}
		>
			{projects.map((project) => {
				return (
					<ComboboxRow
						icon={<FolderKanban size={14} className="text-muted-foreground" />}
						combobox={
							<SlackChannelCombobox
								channel={project.slackChannel ?? null}
								onSelect={async (newChannel: SlackChannel | null) => {
									setProjects((projects) =>
										projects.map((previousProject) =>
											previousProject._id === project._id ?
												{ ...previousProject, slackChannel: newChannel } :
												previousProject
										)
									);

									const result = await updateProject.mutateAsync(
										{
											actor: {
												type: 'User',
												data: { id: actorUser._id },
											},
											project: {
												id: project._id,
											},
											updates: {
												slackChannel: newChannel,
											},
										},
									);
									if (result.isErr()) {
										toast.procedureError(result);
									}

									toast.SLACK_BROADCAST_CHANNEL_UPDATE_SUCCESS();
								}}
								data={slackChannels}
								isLoading={status === 'pending'}
							/>
						}
						isPadded={true}
						title={project.name}
						key={project._id}
					/>
				);
			})}
		</DashboardCard>
	);
}

function RemoveSlackCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization, setOrganization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);

	const mutateUpdateOrganization = trpc.organization.update.useMutation();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const router = useRouter();

	return (
		<DashboardCard
			title="Remove Slack connection"
			subtitle="Are you sure you want to remove your Slack connection?"
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
									slackOrganization: null,
								},
							},
						);

						if (result.isErr()) {
							toast.procedureError(result);
							return;
						}

						toast.REMOVE_ORGANIZATION_SLACK_SUCCESS();
						setOrganization({
							...organization,
							slackOrganization: null,
						});
						router.push(`/${organization.slug}/settings/integrations`);

						setIsLoading(false);
					}}
				>
					Remove
				</Button>
			}
		>
		</DashboardCard>
	);
}
