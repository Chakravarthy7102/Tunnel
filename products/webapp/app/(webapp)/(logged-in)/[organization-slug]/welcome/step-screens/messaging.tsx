import { IntegrationCard } from '#app/(webapp)/(logged-in)/[organization-slug]/welcome/components/integration-card.tsx';
import type { ServerDoc } from '@-/database';
import type {
	Organization_$dashboardPageData,
	OrganizationMember_$dashboardPageData,
} from '@-/database/selections';
import { getSlackAuthUrl } from '@-/integrations';

import {
	SlackIcon,
	TeamsIcon,
} from '@-/integrations/components';

export function MessagingStepScreen(
	{ onContinue, organization, actorOrganizationMember }: {
		onContinue: () => void;
		actorOrganizationMember: ServerDoc<
			typeof OrganizationMember_$dashboardPageData
		>;
		organization: ServerDoc<typeof Organization_$dashboardPageData>;
	},
) {
	return (
		<div className="flex flex-col justify-center items-center gap-y-6">
			<div className="flex flex-col justify-center items-center text-center">
				<h1 className="text-2xl font-medium text-center text-neutral-0">
					Connect to your messaging tool
				</h1>
				<p className="text-base text-neutral-400 max-w-md text-center">
					By connecting your messaging tool, Tunnel can create broadcasts to
					notify your whole team of new feedback.
				</p>
			</div>

			<div className="flex flex-col justify-center items-start w-full gap-4 md:flex-row">
				<IntegrationCard
					organization={organization}
					icon={<SlackIcon variant={'rounded'} />}
					title="Slack"
					description="Connect to create Slack broadcasts with Tunnel"
					isConnected={organization.slackOrganization !== null}
					href={getSlackAuthUrl({
						isPersonalConnection: false,
						organizationMemberId: actorOrganizationMember._id,
						redirectPath: `/${organization.slug}/welcome?page=messaging`,
					})}
				/>
				<IntegrationCard
					organization={organization}
					icon={<TeamsIcon variant={'rounded'} />}
					title="Teams"
					description="Connect to create Teams broadcasts with Tunnel"
					isConnected={false}
					isComingSoon={true}
					href=""
				/>
			</div>

			<button
				onClick={onContinue}
				className="text-sm font-medium hover:underline min-w-max"
			>
				I'll connect later
			</button>
		</div>
	);
}
