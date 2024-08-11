'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { SlackChannelCombobox } from '#components/v1/slack-channels-combobox.tsx';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { buttonVariants, cn } from '@-/design-system/v1';
import { getSlackAuthUrl, type SlackChannel } from '@-/integrations';
import { SlackIcon } from '@-/integrations/components';
import { toast } from '@-/tunnel-error';
import { Slack } from 'lucide-react';

export default function Page() {
	return <SlackBroadcastCard />;
}

function SlackBroadcastCard() {
	const { project, setProject } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { actorOrganizationMember } = useRouteContext(
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
			title="Slack channel"
			subtitle="Keep your team updated with your Tunnel comments"
			isPadded={false}
			icon={<SlackIcon />}
		>
			<div className="flex justify-start items-center w-full p-4">
				{organization.slackOrganization ?
					(
						<SlackChannelCombobox
							align="start"
							channel={project.slackChannel ?? null}
							onSelect={async (newChannel: SlackChannel | null) => {
								setProject({ ...project, slackChannel: newChannel });
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
									return;
								}

								toast.SLACK_BROADCAST_CHANNEL_UPDATE_SUCCESS();
							}}
							data={slackChannels}
							isLoading={status === 'pending'}
						/>
					) :
					(
						<a
							href={getSlackAuthUrl({
								isPersonalConnection: false,
								redirectPath: null,

								organizationMemberId: actorOrganizationMember._id,
							})}
							className={cn(buttonVariants({ variant: 'outline' }))}
						>
							<Slack size={14} className="text-muted-foreground" />
							Connect Slack
						</a>
					)}
			</div>
		</DashboardCard>
	);
}
