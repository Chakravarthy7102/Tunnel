'use client';

import { MuratCard } from '#app/(webapp)/(logged-in)/[organization-slug]/welcome/components/murat-card.tsx';
import type { StepScreenProps } from '#types';
import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { trpc } from '#utils/trpc.ts';
import { createDoc } from '@-/client-doc';
import {
	Button,
	MuratInput,
} from '@-/design-system/v1';
import type { GithubRepository } from '@-/github-integration';
import { MuratGithubRepositoryCombobox } from '@-/github-integration/components';
import type { GitlabProject } from '@-/gitlab-integration';
import { MuratGitlabProjectCombobox } from '@-/gitlab-integration/components';
import { toast } from '@-/tunnel-error';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CreateProjectStepScreen({
	onContinue,
	organization,
	actorOrganizationMember,
}: StepScreenProps) {
	const { actorUser } = useRouteContext('(webapp)/(logged-in)');
	const [isLoading, setIsLoading] = useState(false);
	const [name, setName] = useState('');
	const [githubRepository, setGithubRepository] = useState<
		GithubRepository | null
	>(null);
	const [gitlabProject, setGitlabProject] = useState<GitlabProject | null>(
		null,
	);
	const createProject = trpc.project.create$dashboardPageData.useMutation();
	const documentBody = useDocumentBody();

	useEffect(() => {
		if (githubRepository === null) return;
		setName(githubRepository.full_name.split('/')[1] ?? '');
	}, [githubRepository]);

	useEffect(() => {
		if (gitlabProject === null) return;
		setName(gitlabProject.name);
	}, [gitlabProject]);

	return (
		<div className="flex flex-col justify-center items-center gap-y-6">
			<div className="flex flex-col justify-center items-center text-center">
				<h1 className="text-2xl font-medium text-center text-neutral-0">
					Create your first project
				</h1>
				<p className="text-base text-neutral-400 max-w-md text-center">
					Tunnel helps organizations collect, organize, and resolve feedback
					with a single line of code.
				</p>
			</div>

			<MuratCard className="p-4 flex flex-col justify-center items-start w-full max-w-md gap-y-4">
				{organization.projectsCount === 0 ?
					(
						<>
							<div className="flex flex-col justify-center items-start w-full gap-y-1">
								<label className="text-sm font-normal text-neutral-300">
									Project name
								</label>
								<MuratInput
									value={name}
									onChange={(e) => {
										setName(e.target.value);
									}}
								/>
							</div>

							{organization.githubOrganization && (
								<div className="flex flex-col justify-center items-start w-full gap-y-1">
									<label className="text-sm font-normal text-neutral-300">
										Link a repository
									</label>
									<MuratGithubRepositoryCombobox
										actorUser={createDoc('User', actorUser)}
										value={githubRepository}
										setValue={setGithubRepository}
										organization={createDoc('Organization', organization)}
										isFullWidth={true}
										container={documentBody}
										trpc={trpc}
									/>
								</div>
							)}

							{actorOrganizationMember.linkedGitlabAccount && (
								<div className="flex flex-col justify-center items-start w-full gap-y-1">
									<label className="text-sm font-normal text-neutral-300">
										Link a project
									</label>
									<MuratGitlabProjectCombobox
										actorUser={createDoc('User', actorUser)}
										value={gitlabProject}
										setValue={setGitlabProject}
										organizationMember={createDoc(
											'OrganizationMember',
											actorOrganizationMember,
										)}
										isFullWidth={true}
										container={documentBody}
										trpc={trpc}
									/>
								</div>
							)}
							<Button
								variant="muratblue"
								className="w-full"
								size="muratsm"
								disabled={name.length === 0}
								isLoading={isLoading}
								onClick={async () => {
									if (name.length === 0) return;
									setIsLoading(true);

									const result = await createProject.mutateAsync(
										{
											actor: { type: 'User', data: { id: actorUser._id } },
											name,
											ownerOrganization: {
												id: organization._id,
											},
											organizationMember: {
												id: actorOrganizationMember._id,
											},
											githubRepository: githubRepository ?? null,
											gitlabProject: gitlabProject ?? null,
										},
									);

									if (result.isErr()) {
										toast.procedureError(result);
										return;
									}

									onContinue();
									setIsLoading(false);
								}}
							>
								Continue
							</Button>
						</>
					) :
					(
						<div className="flex flex-row justify-center items-start gap-x-2">
							<div className="h-8 w-8 min-w-8 rounded-full shadow-stroke-input-inline bg-neutral-900 flex justify-center items-center">
								<Check size={16} className="text-green-500" />
							</div>
							<div className="flex flex-col justify-center items-start text-left">
								<p className="text-neutral-0 text-base font-medium">
									You've successfully created your first project
								</p>
								<p className="text-neutral-400 text-sm">
									Projects allow you to keep your feedback organization to the
									repository or team that you are working with.
								</p>
							</div>
						</div>
					)}
			</MuratCard>
			{organization.projectsCount > 0 && (
				<Button
					onClick={onContinue}
					variant={'muratblue'}
					size="muratsm"
					className="w-full"
				>
					Continue
				</Button>
			)}
		</div>
	);
}
