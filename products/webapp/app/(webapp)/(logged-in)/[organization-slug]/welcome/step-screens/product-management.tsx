import { IntegrationCard } from '#app/(webapp)/(logged-in)/[organization-slug]/welcome/components/integration-card.tsx';
import type { StepScreenProps } from '#types';
import { getAsanaAuthUrl, getLinearAuthUrl } from '@-/integrations';
import { AsanaIcon, LinearIcon } from '@-/integrations/components';
import { JiraIcon } from '@-/jira-integration/components';
import { ApiUrl } from '@-/url/api';

export function ProductManagementStepScreen({
	onContinue,
	organization,
	actorOrganizationMember,
}: StepScreenProps) {
	return (
		<div className="flex flex-col justify-center items-center gap-y-6">
			<div className="flex flex-col justify-center items-center text-center">
				<h1 className="text-2xl font-medium text-center text-neutral-0">
					Connect to your product management tool
				</h1>
				<p className="text-base text-neutral-400 max-w-md text-center">
					By connecting your product management tool, Tunnel can create issues
					and sync the status of your feedback.
				</p>
			</div>

			<div className="flex flex-col justify-center items-start w-full gap-4 md:flex-row">
				<IntegrationCard
					organization={organization}
					icon={<JiraIcon variant={'rounded'} />}
					title="Jira"
					description="Connect to create Jira issues with Tunnel"
					isConnected={organization.jiraOrganization !== null}
					href={ApiUrl.getWebappUrl({
						fromWindow: true,
						withScheme: true,
						path:
							`/${organization.slug}/settings/integrations/jira?redirectTo=${
								encodeURIComponent(`/${organization.slug}/welcome?page=product`)
							}`,
					})}
				/>
				<IntegrationCard
					organization={organization}
					icon={<LinearIcon variant={'rounded'} />}
					title="Linear"
					description="Connect to create Linear issues with Tunnel"
					isConnected={organization.linearOrganization !== null}
					href={getLinearAuthUrl({
						isPersonalConnection: false,
						organizationMemberId: actorOrganizationMember._id,
						redirectPath: `/${organization.slug}/welcome?page=product`,
					})}
				/>
				<IntegrationCard
					organization={organization}
					icon={<AsanaIcon variant={'rounded'} />}
					title="Asana"
					description="Connect to create Asana issues with Tunnel"
					isConnected={organization.asanaOrganization !== null}
					href={getAsanaAuthUrl({
						organizationMemberId: actorOrganizationMember._id,
						redirectPath: `/${organization.slug}/welcome?page=product`,
						isPersonalConnection: false,
					})}
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
