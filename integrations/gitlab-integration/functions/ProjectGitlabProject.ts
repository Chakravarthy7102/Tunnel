import { v } from '@-/convex/values';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	defineListHandler,
	protectedListQuery,
	protectedMutation,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { unreachableCase } from '@tunnel/ts';

export const ProjectGitlabProject_create = protectedMutation(
	'ProjectGitlabProject',
	{
		args: {
			input: v.object({
				data: v.object({
					project: v.id('Project'),
					gitlabProjectId: v.number(),
					gitlabProjectName: v.string(),
					gitlabProjectHookId: v.number(),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const id = await dbInsert(
				ctx,
				'ProjectGitlabProject',
				{ ...data },
				{ unique: {} },
			);

			return applyInclude(
				ctx,
				'ProjectGitlabProject',
				id,
				include,
			);
		},
		error: (error) =>
			new UnexpectedError(
				'while associating the gitlab project with the tunnel project',
				{ cause: error },
			),
	},
);

export const ProjectGitlabProject_delete = protectedMutation(
	'ProjectGitlabProject',
	{
		args: {
			input: v.object({
				id: v.id('ProjectGitlabProject'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			await dbDelete(ctx, 'ProjectGitlabProject', id);
		},
		error: (error) =>
			new UnexpectedError('while removing the linked GitLab Project', {
				cause: error,
			}),
	},
);

const listHandler = defineListHandler(
	'ProjectGitlabProject',
	{
		where: v.object({ gitlabProjectId: v.number() }),
	},
	async (ctx, { where, paginationOpts }) => {
		switch (true) {
			case 'gitlabProjectId' in where: {
				return ctx.db
					.query('ProjectGitlabProject')
					.withIndex(
						'by_gitlabProjectId',
						(q) => q.eq('gitlabProjectId', where.gitlabProjectId),
					).paginate(paginationOpts);
			}

			default: {
				return unreachableCase(
					where,
					`Invalid where: ${JSON.stringify(where)}`,
				);
			}
		}
	},
	(error) =>
		new UnexpectedError('while listing GitLab projects', {
			cause: error,
		}),
);

export const ProjectGitlabProject_list = protectedListQuery(
	listHandler,
);
