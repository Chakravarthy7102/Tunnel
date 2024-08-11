/* eslint-disable complexity -- todo */
'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { useRouteContext } from '#utils/route-context.ts';
import { Button, buttonVariants, cn } from '@-/design-system/v1';
import { getGitlabAuthUrl } from '@-/gitlab-integration';
import {
	getAsanaAuthUrl,
	getGithubAuthUrl,
	getJiraAuthUrl,
	getLinearAuthUrl,
	getSlackAuthUrl,
} from '@-/integrations';
import {
	AsanaIcon,
	GithubIcon,
	GitlabIcon,
	JiraIcon,
	LinearIcon,
	SlackIcon,
} from '@-/integrations/components';
import { integrationCopy } from '@-/integrations/shared';
import Link from 'next/link';
import type { ReactNode } from 'react';

export default function PageClient() {
	return (
		<>
			<ProjectIntegrationsCard />
		</>
	);
}

function ProjectIntegrationsCard() {
	const { organization, actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { project } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);

	const shouldShowIntegration = (resource: object | null | undefined) => {
		if (actorOrganizationMember.role !== 'guest') {
			return true;
		}

		return resource !== undefined && resource !== null;
	};

	const organizationHasIntegrations =
		shouldShowIntegration(organization.githubOrganization) ||
		shouldShowIntegration(organization.linearOrganization) ||
		shouldShowIntegration(organization.jiraOrganization) ||
		shouldShowIntegration(organization.asanaOrganization) ||
		shouldShowIntegration(organization.slackOrganization);

	if (!organizationHasIntegrations) {
		return (
			<div className="flex flex-col justify-center items-center border border-dashed border-input bg-inherit py-6 px-2 gap-y-3 w-full rounded-md">
				<div className="flex flex-col justify-center items-center text-center gap-y-1">
					<p className="text-sm font-medium">No integrations</p>
					<p className="text-sm text-muted-foreground">
						This organization has not connected to any integrations yet
					</p>
				</div>
			</div>
		);
	}

	return (
		<>
			{actorOrganizationMember.role !== 'guest' && (
				<DashboardCard
					title="Git providers"
					subtitle="Connect your code reviews with your live previews"
					isPadded={false}
				>
					{shouldShowIntegration(organization.githubOrganization) && (
						<IntegrationRow
							title="GitHub"
							description={integrationCopy('GITHUB')}
							logo={<GithubIcon />}
							linkUrl={organization.githubOrganization ?
								`/${organization.slug}/projects/${project.slug}/integrations/github` :
								getGithubAuthUrl({
									organizationId: organization._id,
									organizationMemberId: actorOrganizationMember._id,

									redirectPath: null,
								})}
							buttonText={organization.githubOrganization ?
								'Manage' :
								'Connect'}
							isDisabled={false}
							isPaid={false}
						/>
					)}
					<IntegrationRow
						title="GitLab"
						description={integrationCopy('GITLAB')}
						logo={<GitlabIcon />}
						linkUrl={actorOrganizationMember.linkedGitlabAccount ?
							`/${organization.slug}/projects/${project.slug}/integrations/gitlab` :
							getGitlabAuthUrl({
								organizationId: organization._id,
								organizationMemberId: actorOrganizationMember._id,

								redirectPath: null,
							})}
						buttonText={actorOrganizationMember.linkedGitlabAccount ?
							'Manage' :
							'Connect'}
						isDisabled={false}
						isPaid={false}
					/>
				</DashboardCard>
			)}
			{(shouldShowIntegration(organization.linearOrganization) ||
				shouldShowIntegration(organization.jiraOrganization) ||
				shouldShowIntegration(organization.asanaOrganization)) && (
				<DashboardCard
					title="Project management"
					subtitle="Sync your previews with your tickets"
					isPadded={false}
				>
					{shouldShowIntegration(organization.linearOrganization) && (
						<IntegrationRow
							title="Linear"
							description={integrationCopy('LINEAR')}
							logo={<LinearIcon />}
							linkUrl={organization.linearOrganization ?
								`/${organization.slug}/projects/${project.slug}/integrations/linear` :
								getLinearAuthUrl({
									isPersonalConnection: false,
									organizationMemberId: actorOrganizationMember._id,

									redirectPath: null,
								})}
							buttonText={organization.linearOrganization ?
								'Manage' :
								'Connect'}
							isDisabled={false}
							isPaid={true}
						/>
					)}
					{shouldShowIntegration(organization.jiraOrganization) && (
						<IntegrationRow
							title="Jira"
							description={integrationCopy('JIRA')}
							logo={<JiraIcon />}
							linkUrl={organization.jiraOrganization ?
								`/${organization.slug}/projects/${project.slug}/integrations/jira` :
								getJiraAuthUrl({
									organizationMemberId: actorOrganizationMember._id,

									redirectPath: null,
								})}
							buttonText={organization.jiraOrganization ?
								'Manage' :
								'Connect'}
							isPaid={true}
							isDisabled={false}
						/>
					)}
					{shouldShowIntegration(organization.asanaOrganization) && (
						<IntegrationRow
							title="Asana"
							description={integrationCopy('ASANA')}
							logo={<AsanaIcon />}
							linkUrl={organization.asanaOrganization ?
								`/${organization.slug}/projects/${project.slug}/integrations/asana` :
								getAsanaAuthUrl({
									isPersonalConnection: false,
									organizationMemberId: actorOrganizationMember._id,
									redirectPath: null,
								})}
							buttonText={organization.asanaOrganization ?
								'Manage' :
								'Connect'}
							isPaid={true}
							isDisabled={false}
						/>
					)}
				</DashboardCard>
			)}
			{shouldShowIntegration(organization.slackOrganization) && (
				<DashboardCard
					title="Messaging"
					subtitle="Sync your previews with your messages"
					isPadded={false}
				>
					<IntegrationRow
						title="Slack"
						description={integrationCopy('SLACK')}
						logo={<SlackIcon />}
						linkUrl={organization.slackOrganization ?
							`/${organization.slug}/projects/${project.slug}/integrations/slack` :
							getSlackAuthUrl({
								isPersonalConnection: false,
								organizationMemberId: actorOrganizationMember._id,

								redirectPath: null,
							})}
						buttonText={organization.slackOrganization ? 'Manage' : 'Connect'}
						isDisabled={false}
						isPaid={true}
					/>
				</DashboardCard>
			)}
		</>
	);
}

const IntegrationRow = ({
	title,
	description,
	logo,
	linkUrl,
	buttonText,
	isDisabled,
}: {
	title: string;
	logo: ReactNode;
	description: string;
	linkUrl: string;
	buttonText: string;
	isDisabled: boolean;
	isPaid: boolean;
}) => {
	return (
		<div className="flex flex-row justify-between items-center w-full p-4 last:border-none border-b border-solid border-input">
			<div className="flex flex-row justify-center items-center gap-x-4">
				{logo}
				<div className="flex flex-col justify-center items-start">
					<p className="text-sm text-foreground">{title}</p>
					<p className="text-sm text-muted-foreground">{description}</p>
				</div>
			</div>
			{isDisabled ?
				(
					<Button variant="outline" disabled={true}>
						{buttonText}
					</Button>
				) :
				(
					<Link
						href={linkUrl}
						className={cn(
							buttonVariants({ variant: 'outline' }),
							'gap-x-2',
						)}
					>
						{buttonText}
					</Link>
				)}
		</div>
	);
};
