import { getWebappTrpc } from '#utils/trpc.ts';
import type { Actor } from '@-/actor';
import { getConvex } from '@-/convex/cli';
import type { Id, ServerDoc } from '@-/database';
import { getVapi } from '@-/database/vapi';
import type { ProjectGitMetadata } from '@-/git-metadata';
import type { GithubRepository } from '@-/github-integration';
import { isCancel, SelectPrompt } from '@clack/core';
import chalk from 'chalk';
import enquirer from 'enquirer';
import { $try, err, ok, ResultAsync, type TryOk } from 'errok';
import path from 'pathe';
import { promptSelectOrganization } from './organization.ts';

/**
	The prompt to display to the user when their local project hasn't been initialized with Tunnel yet (i.e. the `.tunnel.json` file doesn't exist)
*/
export function promptUninitializedLocalProjectAction() {
	const $ok = (value: 'createNewProject' | 'linkExistingProject') => ok(value);
	return ResultAsync.fromFunction(async () => {
		process.stdout.write(
			chalk.magentaBright.bold('🎆 Welcome to Tunnel! ') +
				chalk.dim('(use arrow keys to select an option)') +
				'\n\n',
		);

		const select = new SelectPrompt({
			options: [
				{
					message: 'Create a new project for this app',
					value: 'createNewProject',
					selectedEmoji: '🚀',
				},
				{
					message: 'Add this app to an existing project',
					value: 'linkExistingProject',
					selectedEmoji: chalk.yellow('⚡'),
				},
			],
			render() {
				return this.options
					.map((option) => {
						if (option.value === this.value) {
							return chalk.cyan(
								`❯ ${chalk.bold(option.message)} ${option.selectedEmoji}`,
							);
						} else {
							return `${chalk.hidden('❯')} ${option.message}`;
						}
					})
					.join('\n');
			},
		});

		const action = await select.prompt();
		if (isCancel(action)) {
			return err(new Error('Cancelled'));
		}

		process.stdout.write('\n');

		return $ok(action as 'createNewProject' | 'linkExistingProject');
	});
}

/**
	Prompts the user to select one of their existing projects.
	@param args
	@param args.canCreateNewProject - Whether we should display "Create new Project" as an option to the user
*/
export const promptSelectProject = ({
	actor,
	localProjectRootDirpath,
	localProjectWorkingDirpath,
	canCreateNewProject,
	providedOrganizationSlug,
	localProjectGitMetadata,
}: {
	actor: Actor<'User'>;
	localProjectRootDirpath: string;
	localProjectWorkingDirpath: string;
	canCreateNewProject: boolean;
	providedOrganizationSlug: string | null;
	localProjectGitMetadata: ProjectGitMetadata | null;
}) => ($try(async function*(
	$ok: TryOk<{
		projectId: Id<'Project'>;
		organizationId: Id<'Organization'>;
	}>,
) {
	const { webappTrpc } = await getWebappTrpc();
	const { organizationMember } = yield* promptSelectOrganization({
		actor,
		providedOrganizationSlug,
	}).safeUnwrap();

	const projects = yield* (await webappTrpc.project.list.query({
		actor,
		organizationMember: {
			id: organizationMember._id,
		},
	})).safeUnwrap();

	if (projects.length === 0) {
		const { projectId } = yield* promptCreateFirstProject({
			actor,
			localProjectRootDirpath,
			localProjectWorkingDirpath,
			providedOrganizationSlug,
			localProjectGitMetadata,
		}).safeUnwrap();
		return $ok({
			projectId,
			organizationId: organizationMember.organization._id,
		});
	} else if (projects.length === 1 && projects[0] !== undefined) {
		return $ok({
			projectId: projects[0]._id,
			organizationId: organizationMember.organization._id,
		});
	} else {
		process.stdout.write(
			chalk.magentaBright.bold(
				'📦 Which project is your app associated with?\n',
			),
		);

		const CREATE_NEW_PROJECT = 'CREATE_NEW_PROJECT';

		const projectSelectionPrompt = new SelectPrompt({
			options: [
				...projects.map((project) => ({
					message: project.name,
					value: project._id,
				})),
				...(canCreateNewProject ?
					[
						{
							message: chalk.italic('Create a new project'),
							value: CREATE_NEW_PROJECT,
						},
					] :
					[]),
			],
			render() {
				return this.options
					.map((option) => {
						if (option.value === this.value) {
							if (option.value === CREATE_NEW_PROJECT) {
								return chalk.cyan(`❯ ${chalk.bold(option.message)} 🛠`);
							} else {
								return chalk.cyan(`❯ ${chalk.bold(option.message)}`);
							}
						} else {
							return `${chalk.hidden('❯')} ${option.message}`;
						}
					})
					.join('\n');
			},
		});

		const projectSelection = await projectSelectionPrompt.prompt();

		if (isCancel(projectSelection)) {
			return err(new Error('Cancelled'));
		}

		process.stdout.write('\n');

		if (projectSelection === CREATE_NEW_PROJECT) {
			const { projectId } = yield* promptCreateFirstProject({
				actor,
				localProjectRootDirpath,
				localProjectWorkingDirpath,
				providedOrganizationSlug,
				localProjectGitMetadata,
			}).safeUnwrap();
			return $ok({
				projectId,
				organizationId: organizationMember.organization._id,
			});
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
			const project = projects.find((project) =>
				project._id === projectSelection
			)!;

			// If the user selected an existing project, we ask them if they want to link a GitHub repository
			const githubRepository = yield* getGithubRepositoryToLink({
				organization: organizationMember.organization,
				localProjectGitMetadata,
				project,
				actor,
			}).safeUnwrap();

			if (githubRepository !== null) {
				const result = await webappTrpc.project.update.mutate({
					actor,
					project: {
						id: projectSelection,
					},
					updates: {
						githubRepository,
					},
				});

				if (result.isErr()) {
					process.stderr.write(
						`Failed to link GitHub repository to project: ${result.error.message}\n`,
					);
				}
			}

			return $ok({
				projectId: project._id,
				organizationId: organizationMember.organization._id,
			});
		}
	}
}));

export const getGithubRepositoryToLink = ({
	localProjectGitMetadata,
	project,
	organization,
	actor,
}: {
	localProjectGitMetadata: ProjectGitMetadata | null;
	project: ServerDoc<'Project'> | null;
	organization: { _id: string };
	actor: Actor<'User'>;
}) => ($try(async function*() {
	const { webappTrpc } = await getWebappTrpc();
	let githubRepository: GithubRepository | null = null;
	if (
		localProjectGitMetadata !== null &&
		localProjectGitMetadata.gitUrl !== null
	) {
		const [owner, repo] = localProjectGitMetadata.gitUrl.replace(/\.git$/, '')
			.split('/').slice(-2);
		if (owner === undefined || repo === undefined) {
			return err(
				new Error(
					`Failed to parse git URL "${localProjectGitMetadata.gitUrl}"`,
				),
			);
		}

		if (
			project === null || (
				project.githubRepository === null &&
				project.shouldLinkGithubRepository === null
			)
		) {
			const repository = await webappTrpc.organization.getRepository.query({
				actor,
				organization: { id: organization._id },
				owner,
				repo,
			});

			if (repository.isOk() && repository.value !== null) {
				const { shouldLinkRepository } = await enquirer.prompt<
					{ shouldLinkRepository: boolean }
				>({
					message:
						`Would you like to link your GitHub repository (${repository.value.html_url})?`,
					name: 'shouldLinkRepository',
					type: 'confirm',
				});

				if (shouldLinkRepository) {
					githubRepository = repository.value;
				} else if (project !== null) {
					yield* (await webappTrpc.project.update.mutate({
						actor,
						project: {
							id: project._id,
						},
						updates: {
							shouldLinkGithubRepository: false,
						},
					})).safeUnwrap();
				}
			}
		}
	}

	return ok(githubRepository);
}));

export const createProject = ({
	actor,
	projectName,
	organizationMember,
	organization,
	localProjectGitMetadata,
}: {
	actor: Actor<'User'>;
	organizationMember: { _id: Id<'OrganizationMember'> };
	projectName: string | null;
	organization: { _id: Id<'Organization'> };
	localProjectGitMetadata: ProjectGitMetadata | null;
}) => ($try(async function*() {
	const { webappTrpc } = await getWebappTrpc();

	const githubRepository = await getGithubRepositoryToLink({
		localProjectGitMetadata,
		project: null,
		organization,
		actor,
	}).unwrapOr(null);
	const project = yield* (await webappTrpc.project.create.mutate({
		actor,
		name: projectName,
		ownerOrganization: {
			id: organization._id,
		},
		organizationMember: {
			id: organizationMember._id,
		},
		githubRepository,
		gitlabProject: null,
		shouldLinkGithubRepository: false,
	})).safeUnwrap();

	return ok(project);
}));

/**
	Guides the user through creating their first project on Tunnel.
*/
export const promptCreateFirstProject = ({
	actor,
	localProjectRootDirpath,
	localProjectWorkingDirpath,
	localProjectGitMetadata,
	providedOrganizationSlug,
}: {
	actor: Actor<'User'>;
	localProjectRootDirpath: string;
	localProjectWorkingDirpath: string;
	localProjectGitMetadata: ProjectGitMetadata | null;
	providedOrganizationSlug: string | null;
}) => ($try(async function*(
	$ok: TryOk<{
		projectId: Id<'Project'>;
		organizationId: Id<'Organization'>;
		userLocalWorkspaceId: Id<'UserLocalWorkspace'>;
	}>,
) {
	const { organizationMember } = yield* promptSelectOrganization({
		actor,
		providedOrganizationSlug,
	}).safeUnwrap();

	const project = yield* createProject({
		actor,
		organization: organizationMember.organization,
		localProjectGitMetadata,
		projectName: null,
		organizationMember,
	}).safeUnwrap();
	const convex = await getConvex({ actorUserId: actor.data.id });
	const vapi = await getVapi();
	const userLocalWorkspace = await convex.mutation(
		vapi.v.UserLocalWorkspace_insert,
		{
			input: {
				project: project._id,
				user: actor.data.id,
				linkedTunnelInstanceProxyPreview: null,
				relativeDirpath: path.relative(
					localProjectRootDirpath,
					localProjectWorkingDirpath,
				),
			},
		},
	);

	return $ok({
		projectId: project._id,
		organizationId: organizationMember.organization._id,
		userLocalWorkspaceId: userLocalWorkspace._id,
	});
}));
