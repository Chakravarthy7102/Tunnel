import { ApiGitlab } from '#api';
import type { GitlabProject } from '#types';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import { $try, err, ok } from 'errok';

export const ApiGitlab_listProjects = ({ organizationMemberId }: {
	organizationMemberId: Id<'OrganizationMember'>;
}) => ($try(async function*() {
	const { accessToken } = yield* ApiGitlab.getAccessToken({
		organizationMemberId,
	}).safeUnwrap();

	const response = await fetch(
		`https://gitlab.com/api/v4/projects?access_token=${accessToken}&membership=true`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		},
	);

	if (!response.ok) {
		throw new Error('Failed to fetch projects');
	}

	const projects = await response.json() as GitlabProject[];

	return ok(projects);
}));

export const ApiGitlab_linkProject = ({
	gitlabProjectId,
	gitlabProjectName,
	organizationMemberId,
	organizationId,
	projectId,
}: {
	gitlabProjectId: number;
	gitlabProjectName: string;
	projectId: Id<'Project'>;
	organizationId: Id<'Organization'>;
	organizationMemberId: Id<'OrganizationMember'>;
}) => ($try(async function*() {
	const { page: projectGitlabProjects } = yield* ApiConvex.v
		.ProjectGitlabProject.list({
			where: {
				gitlabProjectId,
			},
			paginationOpts: {
				cursor: null,
				numItems: 100,
			},
			include: {
				project: {
					include: {
						organization: true,
					},
				},
			},
		}).safeUnwrap();

	if (
		projectGitlabProjects.some((projectGitlabProject) =>
			projectGitlabProject.project.organization._id === organizationId
		)
	) {
		return ok(true);
	}

	const gitlabProjectHook = yield* ApiGitlab.createProjectHook({
		gitlabProjectId,
		organizationMemberId,
		organizationId,
	}).safeUnwrap();

	yield* ApiConvex.v.ProjectGitlabProject.create({
		input: {
			data: {
				project: projectId,
				gitlabProjectHookId: gitlabProjectHook.id,
				gitlabProjectId,
				gitlabProjectName,
			},
			include: {},
		},
	}).safeUnwrap();

	return ok(true);
}));

export const ApiGitlab_unlinkProject = ({
	projectId,
}: {
	projectId: Id<'Project'>;
}) => ($try(async function*() {
	const project = yield* ApiConvex.v.Project.get({
		from: {
			id: projectId,
		},
		include: {
			gitlabProject: true,
		},
	}).safeUnwrap();

	if (project === null) {
		return err(new DocumentNotFoundError('Project'));
	}

	if (project.gitlabProject) {
		yield* ApiConvex.v.ProjectGitlabProject.delete({
			input: {
				id: project.gitlabProject._id,
			},
		}).safeUnwrap();
	}

	return ok(true);
}));
