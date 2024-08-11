import { ApiConvex } from '@-/convex/api';
import { ApiGithub } from '@-/github-integration/api';
import enquirer from 'enquirer';
import { $try, err, ok } from 'errok';
import { getTestOrganization } from './organization.ts';
import { getTestUser } from './user.ts';

export const getTestProject = () => ($try(async function*() {
	const testProjectSlug = 'test-project';

	const { userId } = yield* getTestUser().safeUnwrap();
	const { organizationId } = yield* getTestOrganization({
		ownerUserId: userId,
	}).safeUnwrap();

	const project = yield* (await $try(async function*() {
		const existingTestProject = yield* ApiConvex.v.Project.get({
			from: { slug: testProjectSlug },
			include: {},
		}).safeUnwrap();

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Todo
		if (existingTestProject !== null) {
			return ok(existingTestProject);
		}

		return ApiConvex.v.Project.create({
			input: {
				data: {
					slug: testProjectSlug,
					name: 'html-page',
					isUnnamed: false,
					organization: organizationId,
					githubRepository: null,
				},
				include: {},
			},
		});
	})).safeUnwrap();

	if (project.githubRepository !== null) {
		return ok({ projectId: project._id });
	} else {
		const githubRepositories = yield* ApiGithub.listRepositories({
			organizationId,
		}).safeUnwrap();

		if (githubRepositories === null) {
			return err(
				new Error("Organization isn't connected to a GitHub organization"),
			);
		}

		const { repositoryId } = await enquirer.prompt<{ repositoryId: string }>({
			message: 'Select a repository',
			name: 'repositoryId',
			type: 'select',
			choices: githubRepositories.map((repository) => ({
				name: repository.id,
				message: repository.full_name,
			})) as any,
		});

		const githubRepository = yield* ApiGithub.getRepository({
			organizationId,
			repositoryId,
		}).safeUnwrap();

		yield* ApiConvex.v.Project.update({
			input: {
				id: project._id,
				updates: {
					githubRepository,
				},
			},
		}).safeUnwrap();

		return ok({ projectId: project._id });
	}
}));
