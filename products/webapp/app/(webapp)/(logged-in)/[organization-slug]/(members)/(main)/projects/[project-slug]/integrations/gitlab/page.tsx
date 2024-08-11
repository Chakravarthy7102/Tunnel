'use client';

import { DashboardCard } from '#components/v1/cards/card.tsx';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { createDoc } from '@-/client-doc';
import { Button, buttonVariants, cn } from '@-/design-system/v1';
import { getGitlabAuthUrl, type GitlabProject } from '@-/gitlab-integration';
import {
	GitlabIcon,
	GitlabProjectCombobox,
} from '@-/integrations/components';
import { toast } from '@-/tunnel-error';
import {
	Gitlab,
} from 'lucide-react';
import { useState } from 'react';

export default function Page() {
	return <GitlabProjectCard />;
}

function GitlabProjectCard() {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const { organization, actorOrganizationMember } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)',
	);
	const { project } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/projects/[project-slug]',
	);

	const actorUserDoc = createDoc('User', actorUser);
	const actorOrganizationMemberDoc = createDoc(
		'OrganizationMember',
		actorOrganizationMember,
	);

	const [gitlabProject, setGitlabProject] = useState<GitlabProject | null>(
		project.gitlabProject ?
			{
				id: project.gitlabProject.gitlabProjectId,
				name: project.gitlabProject.gitlabProjectName,
			} :
			null,
	);

	const linkGitlabProjectMutation = trpc.gitlab.linkProject.useMutation();
	const unlinkGitlabProjectMutation = trpc.gitlab.unlinkProject.useMutation();
	const [isLoading, setIsLoading] = useState(false);

	const documentBody = useDocumentBody();

	return (
		<DashboardCard
			title="GitLab project"
			subtitle="Link your project to a GitLab project"
			isPadded={false}
			button={actorOrganizationMember.linkedGitlabAccount ?
				(
					<div className="flex flex-row justify-center items-center gap-x-2">
						<Button
							variant="ghost"
							onClick={async () => {
								setGitlabProject(null);
								setIsLoading(true);
								const result = await unlinkGitlabProjectMutation.mutateAsync(
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
									},
								);
								setIsLoading(false);

								if (result.isErr()) {
									toast.procedureError(result);
									return;
								}

								toast.GITLAB_PROJECT_CLEAR_SUCCESS();
							}}
						>
							Clear
						</Button>
						<Button
							isLoading={isLoading}
							disabled={isLoading || !gitlabProject ||
								gitlabProject.id ===
									project.gitlabProject?.gitlabProjectId}
							onClick={async () => {
								if (!gitlabProject) return;
								setIsLoading(true);
								const result = await linkGitlabProjectMutation.mutateAsync(
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
										organizationMember: {
											id: actorOrganizationMember._id,
										},
										organization: {
											id: organization._id,
										},
										gitlabProjectId: gitlabProject.id,
										gitlabProjectName: gitlabProject.name,
									},
								);
								setIsLoading(false);
								if (result.isErr()) {
									toast.procedureError(result);
									return;
								}

								toast.GITLAB_PROJECT_CONNECT_SUCCESS();
							}}
						>
							Save
						</Button>
					</div>
				) :
				undefined}
			icon={<GitlabIcon />}
		>
			<div className="flex justify-start items-center w-full p-4">
				{actorOrganizationMember.linkedGitlabAccount ?
					(
						<GitlabProjectCombobox
							value={gitlabProject}
							setValue={setGitlabProject}
							organizationMember={actorOrganizationMemberDoc}
							actorUser={actorUserDoc}
							isFullWidth={false}
							trpc={trpc}
							container={documentBody}
						/>
					) :
					typeof window !== 'undefined' && (
						<a
							href={getGitlabAuthUrl({
								organizationId: organization._id,
								redirectPath: null,

								organizationMemberId: actorOrganizationMember._id,
							})}
							className={cn(buttonVariants({ variant: 'outline' }))}
						>
							<Gitlab size={14} className="text-muted-foreground" />
							Connect GitLab
						</a>
					)}
			</div>
		</DashboardCard>
	);
}
