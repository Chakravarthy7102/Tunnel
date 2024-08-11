'use client';

import { useDocumentBody } from '#utils/document.ts';
import { trpc } from '#utils/trpc.ts';
import { createDoc } from '@-/client-doc';
import type { ServerDoc } from '@-/database';
import type {
	Organization_$dashboardPageData,
	OrganizationMember_$userData,
	Project_$dashboardPageData,
	User_$profileData,
} from '@-/database/selections';
import {
	Button,
	type ButtonProps,
	buttonVariants,
	cn,
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	Input,
} from '@-/design-system/v1';
import type { GithubRepository } from '@-/github-integration';
import {
	getGithubAuthUrl,
	getGitlabAuthUrl,
	type GitlabProject,
} from '@-/integrations';
import {
	GithubRepositoryCombobox,
	GitlabProjectCombobox,
} from '@-/integrations/components';
import { toast } from '@-/tunnel-error';
import { Github, Gitlab } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export function CreateProjectButton({
	organization,
	setProjects,
	actorOrganizationMember,
	actorUser,
	...props
}: ButtonProps & {
	organization: ServerDoc<typeof Organization_$dashboardPageData>;
	setProjects: Dispatch<
		SetStateAction<ServerDoc<typeof Project_$dashboardPageData>[]>
	>;
	actorOrganizationMember: ServerDoc<
		typeof OrganizationMember_$userData
	>;
	actorUser: ServerDoc<typeof User_$profileData>;
}) {
	const [name, setName] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [value, setValue] = useState<GithubRepository | null>(null);
	const [gitlabProject, setGitlabProject] = useState<GitlabProject | null>(
		null,
	);

	const createProject = trpc.project.create$dashboardPageData.useMutation();

	const form = useForm();
	const documentBody = useDocumentBody();

	const router = useRouter();

	const urlParams = new URLSearchParams(
		typeof window === 'undefined' ? '' : window.location.search,
	);
	const createProjectOpen = urlParams.get('createProjectOpen');
	const projectName = urlParams.get('projectName');

	useEffect(() => {
		if (createProjectOpen === 'true') {
			setIsOpen(true);
		}

		if (typeof projectName === 'string') {
			setName(decodeURIComponent(projectName));
		}
	}, [createProjectOpen, projectName]);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button {...props} />
			</DialogTrigger>

			<DialogContent container={documentBody}>
				<DialogHeader>
					<DialogTitle>Create project</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form className="w-full" onSubmit={(e) => e.preventDefault()}>
						<DialogBody className="gap-y-4">
							<FormField
								control={form.control}
								name="project-name"
								render={({ field }) => (
									<FormItem className="w-full">
										<FormLabel>Project Name</FormLabel>
										<FormControl>
											<Input
												{...field}
												value={name.slice(0, 32)}
												onChange={(e) => setName(e.target.value.slice(0, 32))}
											/>
										</FormControl>
									</FormItem>
								)}
							/>

							<div className="flex flex-col justify-center items-start w-full gap-y-2">
								<FormLabel>Link a Repository</FormLabel>
								{!organization.githubOrganization &&
									!actorOrganizationMember.linkedGitlabAccount && (
									<div className="flex flex-row justify-center items-center gap-x-1">
										<a
											href={getGithubAuthUrl({
												organizationId: organization._id,
												organizationMemberId: actorOrganizationMember._id,
												redirectPath: null,
											})}
											className={cn(buttonVariants({ variant: 'outline' }))}
										>
											<Github size={14} className="text-muted-foreground" />
											Connect GitHub
										</a>
										<a
											href={getGitlabAuthUrl({
												organizationId: organization._id,
												organizationMemberId: actorOrganizationMember._id,
												redirectPath: null,
											})}
											className={cn(buttonVariants({ variant: 'outline' }))}
										>
											<Gitlab size={14} className="text-muted-foreground" />
											Connect Gitlab
										</a>
									</div>
								)}

								{organization.githubOrganization &&
									(
										<GithubRepositoryCombobox
											value={value}
											setValue={setValue}
											organization={createDoc('Organization', organization)}
											actorUser={createDoc('User', actorUser)}
											isFullWidth={true}
											trpc={trpc}
											container={documentBody}
										/>
									)}

								{actorOrganizationMember.linkedGitlabAccount && (
									<GitlabProjectCombobox
										value={gitlabProject}
										setValue={setGitlabProject}
										organizationMember={createDoc(
											'OrganizationMember',
											actorOrganizationMember,
										)}
										actorUser={createDoc('User', actorUser)}
										isFullWidth={true}
										trpc={trpc}
										container={documentBody}
									/>
								)}
							</div>
						</DialogBody>

						<DialogFooter>
							<Button
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
											githubRepository: value ?? null,
											gitlabProject: gitlabProject ?? null,
										},
									);

									if (result.isErr()) {
										toast.procedureError(result);
										return;
									}

									toast.CREATE_PROJECT_SUCCESS();
									setProjects((projects) => [...projects, result.value]);
									router.push(
										`/${organization.slug}/projects/${result.value.slug}`,
									);

									setIsLoading(false);
									setIsOpen(false);
								}}
							>
								Create
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
