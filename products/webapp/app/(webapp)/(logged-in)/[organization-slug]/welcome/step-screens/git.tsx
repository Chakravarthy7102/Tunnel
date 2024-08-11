import { IntegrationCard } from '#app/(webapp)/(logged-in)/[organization-slug]/welcome/components/integration-card.tsx';
import type { StepScreenProps } from '#types';
import { getGithubAuthUrl } from '@-/github-integration';
import { GithubIcon } from '@-/github-integration/components';
import { getGitlabAuthUrl } from '@-/gitlab-integration';
import { GitlabIcon } from '@-/gitlab-integration/components';

export function GitStepScreen({
	onContinue,
	organization,
	actorOrganizationMember,
}: StepScreenProps) {
	return (
		<div className="flex flex-col justify-center items-center gap-y-6">
			<div className="flex flex-col justify-center items-center text-center">
				<h1 className="text-2xl font-medium text-center text-neutral-0">
					Connect to your git provider
				</h1>
				<p className="text-base text-neutral-400 max-w-md text-center">
					By connecting your git provider, Tunnel can sync your pull requests to
					your feedback.
				</p>
			</div>

			<div className="flex flex-col justify-center items-start w-full gap-4 md:flex-row">
				<IntegrationCard
					organization={organization}
					icon={<GithubIcon variant={'rounded'} />}
					title="GitHub"
					description="Connect to sync your pull requests to Tunnel"
					isConnected={organization.githubOrganization !== null}
					href={getGithubAuthUrl({
						organizationId: organization._id,
						organizationMemberId: actorOrganizationMember._id,
						redirectPath: `/${organization.slug}/welcome?page=git`,
					})}
				/>
				<IntegrationCard
					organization={organization}
					icon={<GitlabIcon variant={'rounded'} />}
					title="Gitlab"
					description="Connect to sync your merge requests to Tunnel"
					isConnected={actorOrganizationMember.linkedGitlabAccount !== null}
					href={getGitlabAuthUrl({
						organizationId: organization._id,
						organizationMemberId: actorOrganizationMember._id,
						redirectPath: `/${organization.slug}/welcome?page=git`,
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
