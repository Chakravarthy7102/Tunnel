import { v } from '@-/convex/values';
import type { Doc } from '@-/database';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	dbPatch,
	defineGetHandler,
	defineListHandler,
	protectedGetQuery,
	protectedListQuery,
	protectedMutation,
} from '@-/database/function-utils';
import {
	Project_$dashboardPageData,
	Project_$organizationData,
	Project_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import {
	asanaSettingsValidator,
	githubRepositoryValidator,
	jiraSettingsValidator,
	linearSettingsValidator,
	slackChannelValidator,
} from '@-/integrations/validators';
import { unreachableCase } from '@tunnel/ts';
import { vNullable } from 'corvex';

export const Project_create = protectedMutation(
	'Project',
	{
		args: {
			input: v.object({
				data: v.object({
					organization: v.id('Organization'),
					name: v.string(),
					slug: v.string(),
					isUnnamed: v.boolean(),
					githubRepository: v.optional(vNullable(githubRepositoryValidator)),
					// gitlab
					gitlabProjectId: v.optional(v.number()),
					gitlabProjectName: v.optional(v.string()),
					gitlabProjectHookId: v.optional(v.number()),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const {
				name,
				gitlabProjectId,
				gitlabProjectName,
				gitlabProjectHookId,
				...restData
			} = data;

			const slicedName = name.slice(0, 32);

			const id = await dbInsert(
				ctx,
				'Project',
				{
					...restData,
					githubRepository: data.githubRepository ?? null,
					name: slicedName,
					updatedAt: Date.now(),
					slackChannel: null,
					isAutoScreenshotEnabled: true,
					isSessionRecordingEnabled: true,
					asanaSettings: null,
					jiraSettings: null,
					linearSettings: null,
					shouldLinkGithubRepository: null,
				},
				{ unique: {} },
			);

			if (gitlabProjectId && gitlabProjectHookId && gitlabProjectName) {
				await dbInsert(ctx, 'ProjectGitlabProject', {
					gitlabProjectId,
					gitlabProjectHookId,
					gitlabProjectName,
					project: id,
				}, { unique: {} });
			}

			const organization = await ctx.db.get(data.organization);
			if (organization === null) {
				throw new Error(`Organization not found: ${data.organization}`);
			}

			await ctx.db.patch(organization._id, {
				projectsCount: (organization.projectsCount ?? 0) + 1,
			});

			return applyInclude(ctx, 'Project', id, include);
		},
		error: (error) =>
			new UnexpectedError('while creating the project', { cause: error }),
	},
);

const getHandler = defineGetHandler(
	'Project',
	{
		from: v.union(
			v.object({ id: v.union(v.id('Project'), v.string()) }),
			v.object({ slug: v.string() }),
		),
	},
	async (ctx, { from }) => {
		switch (true) {
			case 'id' in from: {
				return ctx.db.normalizeId('Project', from.id);
			}

			case 'slug' in from: {
				return (
					await ctx.db.query('Project').withIndex(
						'by_slug',
						(q) => q.eq('slug', from.slug),
					).first() ??
						ctx.db.query('Project').withIndex(
							'by_cid',
							(q) => q.eq('cid', from.slug),
						).first()
				);
			}

			default: {
				return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
			}
		}
	},
	(error) =>
		new UnexpectedError('while retrieving the project', { cause: error }),
);

export const Project_get = protectedGetQuery(getHandler);
export const Project_get_dashboardPageData = protectedGetQuery(
	getHandler,
	Project_$dashboardPageData,
);
export const Project_get_tunnelInstancePageToolbarData = protectedGetQuery(
	getHandler,
	Project_$tunnelInstancePageToolbarData,
);

const listHandler = defineListHandler(
	'Project',
	{
		where: v.union(
			v.object({
				organizationMember: v.id('OrganizationMember'),
			}),
			v.object({
				githubRepositoryId: v.number(),
			}),
			v.object({
				gitlabProjectId: v.number(),
				organization: v.id('Organization'),
			}),
			v.object({
				user: v.id('User'),
			}),
		),
	},
	async (ctx, { where, paginationOpts }) => {
		switch (true) {
			case 'githubRepositoryId' in where: {
				return ctx.db
					.query('Project')
					.withIndex(
						'by_githubRepositoryId',
						(q) => q.eq('githubRepository.id', where.githubRepositoryId),
					)
					.paginate(paginationOpts);
			}

			case 'gitlabProjectId' in where: {
				const projectGitlabProjects = await ctx.db
					.query('ProjectGitlabProject')
					.withIndex(
						'by_gitlabProjectId',
						(q) => q.eq('gitlabProjectId', where.gitlabProjectId),
					).collect();

				const projectIds = projectGitlabProjects.map((projectGitlabProject) =>
					projectGitlabProject.project
				);

				const projects = await Promise.all(
					projectIds.map(async (id) => ctx.db.get(id)),
				);

				const filteredProjects = projects.filter((
					project,
				): project is Doc<'Project'> =>
					project !== null &&
					project.organization === where.organization
				);

				return { page: filteredProjects, continueCursor: '', isDone: true };
			}

			case 'organizationMember' in where: {
				const organizationMember = await ctx.db.get(where.organizationMember);
				if (organizationMember === null) {
					return {
						page: [],
						continueCursor: '',
						isDone: true,
					};
				}

				if (organizationMember.role === 'guest') {
					const authorizedProjectIds = (await ctx.db
						.query('OrganizationMemberAuthorizedProjectRelation')
						.withIndex(
							'by_organizationMember',
							(q) => q.eq('organizationMember', where.organizationMember),
						)
						.collect()).map((relation) => relation.project);

					return ctx.db
						.query('Project')
						.withIndex(
							'by_organization',
							(q) => q.eq('organization', organizationMember.organization),
						)
						.filter((q) =>
							q.or(
								...authorizedProjectIds.map((authorizedProjectId) =>
									q.eq(q.field('_id'), authorizedProjectId)
								),
							)
						)
						.paginate(paginationOpts);
				} else {
					return ctx.db
						.query('Project')
						.withIndex(
							'by_organization',
							(q) => q.eq('organization', organizationMember.organization),
						)
						.paginate(paginationOpts);
				}
			}

			case 'user' in where: {
				const organizationMembers = await ctx.db
					.query('OrganizationMember')
					.withIndex('by_user', (q) => q.eq('user', where.user))
					.collect();

				const organizationIds = organizationMembers.map((
					organizationMember,
				) => organizationMember.organization);

				return ctx.db.query('Project')
					.filter((q) =>
						q.or(
							...organizationIds.map((organizationId) =>
								q.eq(q.field('organization'), organizationId)
							),
						)
					).paginate(paginationOpts);
			}

			default: {
				return unreachableCase(where);
			}
		}
	},
	(error) => new UnexpectedError('while listing projects', { cause: error }),
);

export const Project_list = protectedListQuery(listHandler);
export const Project_listOrganizationData = protectedListQuery(
	listHandler,
	Project_$organizationData,
);
export const Project_list_dashboardPageData = protectedListQuery(
	listHandler,
	Project_$dashboardPageData,
);

export const Project_update = protectedMutation(
	'Project',
	{
		args: {
			input: v.object({
				id: v.id('Project'),
				updates: v.object({
					name: v.optional(v.string()),
					githubRepository: v.optional(vNullable(githubRepositoryValidator)),
					slackChannel: v.optional(vNullable(slackChannelValidator)),
					isSessionRecordingEnabled: v.optional(v.boolean()),
					isAutoScreenshotEnabled: v.optional(v.boolean()),
					asanaSettings: v.optional(vNullable(asanaSettingsValidator)),
					jiraSettings: v.optional(vNullable(jiraSettingsValidator)),
					linearSettings: v.optional(vNullable(linearSettingsValidator)),
					shouldLinkGithubRepository: v.optional(v.boolean()),
				}),
			}),
		},

		async handler(ctx, { input: { id, updates } }) {
			const { name: unslicedName } = updates;
			const updatedName = unslicedName?.slice(0, 32);

			await dbPatch(ctx, 'Project', id, {
				...updates,
				...(updatedName !== undefined ?
					{ name: updatedName, isUnnamed: false } :
					{}),
			}, { unique: {} });
		},
		error: (error) =>
			new UnexpectedError('while updating the project', { cause: error }),
	},
);

export const Project_delete = protectedMutation(
	'Project',
	{
		args: {
			input: v.object({
				id: v.id('Project'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			await dbDelete(ctx, 'Project', id);
		},
		error: (error) =>
			new UnexpectedError('while deleting the project', { cause: error }),
	},
);
