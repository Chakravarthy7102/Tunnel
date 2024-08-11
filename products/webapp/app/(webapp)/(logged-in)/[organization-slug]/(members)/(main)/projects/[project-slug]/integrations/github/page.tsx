'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { createDoc } from '@-/client-doc';
import { Button, buttonVariants, cn } from '@-/design-system/v1';
import { getGithubAuthUrl, type GithubRepository } from '@-/github-integration';
import {
	GithubIcon,
	GithubRepositoryCombobox,
} from '@-/integrations/components';
import { toast } from '@-/tunnel-error';
import {
	Github,
} from 'lucide-react';
import { useState } from 'react';

export default function Page() {
	return <GithubRepositoryCard />;
}

function GithubRepositoryCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization, actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { project } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);

	const organizationDoc = createDoc('Organization', organization);
	const actorUserDoc = createDoc('User', actorUser);

	const [repository, setRepository] = useState<GithubRepository | null>(
		project.githubRepository,
	);
	const updateProjectMutation = trpc.project.update.useMutation();
	const [isLoading, setIsLoading] = useState(false);

	const documentBody = useDocumentBody();

	return (
		<DashboardCard
			title="GitHub repository"
			subtitle="Link your project to a GitHub repository"
			isPadded={false}
			button={organization.githubOrganization ?
				(
					<div className="flex flex-row justify-center items-center gap-x-2">
						<Button
							variant="ghost"
							onClick={async () => {
								setRepository(null);
								setIsLoading(true);
								const result = await updateProjectMutation.mutateAsync(
									{
										actor: {
											type: 'User',
											data: {
												id: actorUser._id,
											},
										},
										project: {
											id: project._id,
										},
										updates: {
											githubRepository: null,
										},
									},
								);
								setIsLoading(false);

								if (result.isErr()) {
									toast.procedureError(result);
									return;
								}

								toast.GITHUB_REPOSITORY_CLEAR_SUCCESS();
							}}
						>
							Clear
						</Button>
						<Button
							isLoading={isLoading}
							disabled={isLoading || repository === project.githubRepository}
							onClick={async () => {
								setIsLoading(true);
								const result = await updateProjectMutation.mutateAsync(
									{
										actor: {
											type: 'User',
											data: {
												id: actorUser._id,
											},
										},
										project: {
											id: project._id,
										},
										updates: {
											githubRepository: repository,
										},
									},
								);
								setIsLoading(false);
								if (result.isErr()) {
									toast.procedureError(result);
									return;
								}

								toast.GITHUB_REPOSITORY_CONNECT_SUCCESS();
							}}
						>
							Save
						</Button>
					</div>
				) :
				undefined}
			icon={<GithubIcon />}
		>
			<div className="flex justify-start items-center w-full p-4">
				{organization.githubOrganization ?
					(
						<GithubRepositoryCombobox
							value={repository}
							setValue={setRepository}
							organization={organizationDoc}
							actorUser={actorUserDoc}
							isFullWidth={false}
							trpc={trpc}
							container={documentBody}
						/>
					) :
					typeof window !== 'undefined' && (
						<a
							href={getGithubAuthUrl({
								organizationId: organization._id,
								redirectPath: null,

								organizationMemberId: actorOrganizationMember._id,
							})}
							className={cn(buttonVariants({ variant: 'outline' }))}
						>
							<Github size={14} className="text-muted-foreground" />
							Connect GitHub
						</a>
					)}
			</div>
		</DashboardCard>
	);
}
