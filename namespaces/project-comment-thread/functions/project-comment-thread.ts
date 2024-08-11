import { buildFilteredProjectCommentThreadsFilterExpression } from '#function-utils/filters.ts';
import { getOrganizationMemberIdSchema } from '#schemas/organization-member.ts';
import type { FilterKey, NormalizedFilterChoice } from '#types';
import { projectCommentThreadFiltersValidator } from '#validators/filters.ts';
import { gitMetadataPropertyValidators } from '#validators/git.ts';
import { windowMetadataPropertyValidators } from '#validators/window.ts';
import { createCid, type Doc, type Id } from '@-/database';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	dbPatch,
	defineGetHandler,
	defineListHandler,
	defineMutation,
	listQuery,
	protectedGetQuery,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import {
	ProjectCommentThread_$dashboardPageData,
	ProjectCommentThread_$projectCommentThreadPageData,
	ProjectCommentThread_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { projectCommentThreadGitMetadataSchema } from '@-/git-metadata/schemas';
import {
	getProjectLivePreviewIdSchema,
} from '@-/project-live-preview/schemas';
import { windowMetadataSchema } from '@-/window-metadata/schemas';
// import { projectCommentThreadGitMetadataSchema } from '@-/git-metadata/schemas';
import { type Infer, v } from '@-/convex/values';
import { slackCommentMetadataValidator } from '@-/integrations/validators';
import { OrganizationMemberRoleInput } from '@-/organization-member';
import { getOrganizationIdSchema } from '@-/organization/schemas';
import { getProjectIdSchema } from '@-/project/schemas';
import { getUserIdSchema } from '@-/user/schemas';
import { z } from '@-/zod';
import { unreachableCase } from '@tunnel/ts';
import { vNullable } from 'corvex';

export const ProjectCommentThread_insert = defineMutation({
	table: 'ProjectCommentThread',
	input: v.object({
		data: v.object({
			anchorElementXpath: vNullable(v.string()),
			slug: v.string(),
			project: v.id('Project'),
			organization: v.id('Organization'),
			percentageLeft: v.float64(),
			percentageTop: v.float64(),
			route: v.string(),
			linkedProjectLivePreview: vNullable(v.id('ProjectLivePreview')),
			resolvedByUser: vNullable(v.id('User')),
			windowMetadata: vNullable(v.object(windowMetadataPropertyValidators)),
			gitMetadata: vNullable(v.object(gitMetadataPropertyValidators)),
			slackMetadata: vNullable(slackCommentMetadataValidator),
			networkLogEntriesCount: v.number(),
			consoleLogEntriesCount: v.number(),
		}),
	}),
	schema: (ctx, args) => (z.object({
		data: z.object({
			anchorElementXpath: z.string().nullable(),
			slug: z.string(),
			project: getProjectIdSchema(ctx, args, {
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			}),
			organization: getOrganizationIdSchema(ctx, args, {
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
				plans: 'any',
			}),
			percentageLeft: z.number(),
			percentageTop: z.number(),
			route: z.string(),
			linkedProjectLivePreview: getProjectLivePreviewIdSchema(
				ctx,
				args,
				{ actorRelation: 'hasPermission' },
			).nullable(),
			resolvedByUser: getUserIdSchema(ctx, args, {
				actorRelation: 'actor',
			}).nullable(),
			windowMetadata: windowMetadataSchema.nullable(),
			gitMetadata: projectCommentThreadGitMetadataSchema.nullable(),
			slackMetadata: z.object({
				parentTS: z.string(),
				channelId: z.string(),
				channelName: z.string(),
				messageId: z.string(),
				permalink: z.string(),
			}).nullable(),
			networkLogEntriesCount: z.number(),
			consoleLogEntriesCount: z.number(),
		}),
	})),
	async handler(ctx, { input: { data } }) {
		const project = await ctx.db.get(data.project);

		if (project === null) {
			throw new Error('Project does not exist');
		}

		const { windowMetadata, gitMetadata, ...projectCommentThreadData } = data;
		const id = await dbInsert(
			ctx,
			'ProjectCommentThread',
			{
				...projectCommentThreadData,
				slug: createCid(),
				organization: project.organization,
				updatedAt: Date.now(),
				xpathType: 'similo',
			},
			{ unique: {} },
		);

		if (windowMetadata !== null) {
			await dbInsert(
				ctx,
				'ProjectCommentThreadWindowMetadata',
				{ ...windowMetadata, projectCommentThread: id },
				{ unique: {} },
			);
		}

		if (gitMetadata !== null) {
			await dbInsert(
				ctx,
				'ProjectCommentThreadGitMetadata',
				{ ...gitMetadata, projectCommentThread: id },
				{ unique: {} },
			);
		}

		return applyInclude(ctx, 'ProjectCommentThread', id, {});
	},
	error: (error) =>
		new UnexpectedError(
			'while creating the project comment thread',
			{ cause: error },
		),
});

export const ProjectCommentThread__create = protectedMutation(
	'ProjectCommentThread',
	{
		args: {
			input: v.object({
				data: v.object({
					anchorElementXpath: vNullable(v.string()),
					project: v.id('Project'),
					organization: v.id('Organization'),
					percentageLeft: v.float64(),
					percentageTop: v.float64(),
					route: v.string(),
					linkedProjectLivePreview: vNullable(v.id('ProjectLivePreview')),
					resolvedByUser: vNullable(v.id('User')),
					windowMetadata: vNullable(v.object(windowMetadataPropertyValidators)),
					gitMetadata: vNullable(v.object(gitMetadataPropertyValidators)),
					slackMetadata: vNullable(slackCommentMetadataValidator),
					networkLogEntriesCount: v.number(),
					consoleLogEntriesCount: v.number(),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const project = await ctx.db.get(data.project);

			if (project === null) {
				throw new Error('Project does not exist');
			}

			const { windowMetadata, gitMetadata, ...projectCommentThreadData } = data;
			const id = await dbInsert(
				ctx,
				'ProjectCommentThread',
				{
					...projectCommentThreadData,
					slug: createCid(),
					organization: project.organization,
					updatedAt: Date.now(),
					xpathType: 'similo',
				},
				{ unique: {} },
			);

			if (windowMetadata !== null) {
				await dbInsert(
					ctx,
					'ProjectCommentThreadWindowMetadata',
					{ ...windowMetadata, projectCommentThread: id },
					{ unique: {} },
				);
			}

			if (gitMetadata !== null) {
				await dbInsert(
					ctx,
					'ProjectCommentThreadGitMetadata',
					{ ...gitMetadata, projectCommentThread: id },
					{ unique: {} },
				);
			}

			return applyInclude(ctx, 'ProjectCommentThread', id, include);
		},
		error: (error) =>
			new UnexpectedError(
				'while creating the project comment thread',
				{ cause: error },
			),
	},
);

const getHandler = defineGetHandler(
	'ProjectCommentThread',
	{
		from: v.union(
			v.object({ id: v.id('ProjectCommentThread') }),
			v.object({ projectLinearIssueId: v.string() }),
			v.object({ projectAsanaTaskGid: v.string() }),
			v.object({ projectSlackMessageId: v.string() }),
			v.object({
				parentTS: v.string(),
				channelId: v.string(),
			}),
		),
	},
	async (ctx, { from }) => {
		switch (true) {
			case 'id' in from: {
				return from.id;
			}

			case 'projectLinearIssueId' in from: {
				const projectLinearIssue = await ctx.db
					.query('ProjectLinearIssue')
					.withIndex(
						'by_issueId',
						(q) => q.eq('issueId', from.projectLinearIssueId),
					)
					.first();

				if (!projectLinearIssue) {
					return null;
				}

				const projectCommentThreadLinearIssueRelation = await ctx.db
					.query('ProjectCommentThreadLinearIssueRelation')
					.withIndex(
						'by_projectLinearIssue',
						(q) => q.eq('projectLinearIssue', projectLinearIssue._id),
					)
					.first();

				if (!projectCommentThreadLinearIssueRelation) {
					return null;
				}

				const projectCommentThread = await ctx.db.get(
					projectCommentThreadLinearIssueRelation.projectCommentThread,
				);

				if (!projectCommentThread) {
					return null;
				}

				return projectCommentThread;
			}

			case 'projectAsanaTaskGid' in from: {
				const projectAsanaTask = await ctx.db
					.query('ProjectAsanaTask')
					.withIndex(
						'by_gid',
						(q) => q.eq('gid', from.projectAsanaTaskGid),
					)
					.first();

				if (!projectAsanaTask) {
					return null;
				}

				const projectCommentThreadAsanaTaskRelation = await ctx.db
					.query('ProjectCommentThreadAsanaTaskRelation')
					.withIndex(
						'by_projectAsanaTask',
						(q) => q.eq('projectAsanaTask', projectAsanaTask._id),
					)
					.first();

				if (!projectCommentThreadAsanaTaskRelation) {
					return null;
				}

				const projectCommentThread = await ctx.db.get(
					projectCommentThreadAsanaTaskRelation.projectCommentThread,
				);

				if (!projectCommentThread) {
					return null;
				}

				return projectCommentThread;
			}

			case 'projectSlackMessageId' in from: {
				const projectSlackMessage = await ctx.db
					.query('ProjectSlackMessage')
					.withIndex(
						'by_messageId',
						(q) => q.eq('messageId', from.projectSlackMessageId),
					)
					.first();

				if (!projectSlackMessage) {
					return null;
				}

				const projectCommentThreadSlackMessageRelation = await ctx.db
					.query('ProjectCommentThreadSlackMessageRelation')
					.withIndex(
						'by_projectSlackMessage',
						(q) => q.eq('projectSlackMessage', projectSlackMessage._id),
					)
					.first();

				if (!projectCommentThreadSlackMessageRelation) {
					return null;
				}

				const projectCommentThread = await ctx.db.get(
					projectCommentThreadSlackMessageRelation.projectCommentThread,
				);

				if (!projectCommentThread) {
					return null;
				}

				return projectCommentThread;
			}

			case 'parentTS' in from: {
				const projectCommentThread = await ctx.db
					.query('ProjectCommentThread')
					.filter((q) => {
						return q.and(
							q.eq(q.field('slackMetadata.parentTS'), from.parentTS),
							q.eq(q.field('slackMetadata.channelId'), from.channelId),
						);
					})
					.first();

				if (!projectCommentThread) {
					return null;
				}

				return projectCommentThread;
			}

			default: {
				return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
			}
		}
	},
	(error) =>
		new UnexpectedError(
			'while retrieving the project comment thread',
			{ cause: error },
		),
);

export const ProjectCommentThread_get = protectedGetQuery(getHandler);
export const ProjectCommentThread_get_projectCommentThreadPageData =
	protectedGetQuery(
		getHandler,
		ProjectCommentThread_$projectCommentThreadPageData,
	);

const listHandler = defineListHandler(
	'ProjectCommentThread',
	{
		where: v.union(
			v.object({
				linkedProjectLivePreview: v.id('ProjectLivePreview'),
				filtersSelection: vNullable(projectCommentThreadFiltersValidator),
			}),
			v.object({
				organization: v.id('Organization'),
				filtersSelection: vNullable(projectCommentThreadFiltersValidator),
			}),
			v.object({
				project: v.id('Project'),
				filtersSelection: vNullable(projectCommentThreadFiltersValidator),
			}),
			v.object({
				organizationMember: v.id('OrganizationMember'),
				filtersSelection: vNullable(projectCommentThreadFiltersValidator),
			}),
		),
	},
	(ctx, args) => (z.union([
		z.object({
			linkedProjectLivePreview: getProjectLivePreviewIdSchema(ctx, args, {
				actorRelation: 'hasPermission',
			}),
			filtersSelection: z.any(),
		}),
		z.object({
			organization: getOrganizationIdSchema(ctx, args, {
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
				plans: 'any',
			}),
			filtersSelection: z.any(),
		}),
		z.object({
			project: getProjectIdSchema(ctx, args, {
				actorOrganizationMemberRole: OrganizationMemberRoleInput.guestOrHigher,
			}),
			filtersSelection: z.any(),
		}),
		z.object({
			organizationMember: getOrganizationMemberIdSchema(ctx, args, {
				actorRelation: 'actor',
				actorOrganizationMemberRole: OrganizationMemberRoleInput.memberOrHigher,
			}),
			filtersSelection: z.any(),
		}),
	])),
	async (ctx, { where, paginationOpts }) => {
		const getOrganizationProjectCommentThreads = async (
			{ organization, filtersSelection }: {
				organization: Id<'Organization'>;
				filtersSelection:
					| Infer<typeof projectCommentThreadFiltersValidator>
					| null;
			},
		) => {
			// If there are no filters, then return all comments using a single index
			if (filtersSelection === null) {
				return ctx.db
					.query('ProjectCommentThread')
					.withIndex(
						'by_organization',
						(q) => q.eq('organization', organization),
					)
					.order('desc')
					.paginate(paginationOpts);
			} else {
				const filterExpression =
					await buildFilteredProjectCommentThreadsFilterExpression(
						ctx,
						{ filtersSelection, organization },
					);

				return ctx.db.query('ProjectCommentThread')
					.withIndex(
						'by_organization',
						(q) => q.eq('organization', organization),
					)
					.filter(filterExpression)
					.order('desc')
					.paginate(paginationOpts);
			}
		};

		switch (true) {
			case 'linkedProjectLivePreview' in where: {
				if (where.filtersSelection === null) {
					return ctx.db
						.query('ProjectCommentThread')
						.withIndex(
							'by_linkedProjectLivePreview',
							(q) =>
								q.eq(
									'linkedProjectLivePreview',
									where.linkedProjectLivePreview,
								),
						)
						.order('desc')
						.paginate(paginationOpts);
				} else {
					const { filtersSelection } = where;
					const filterExpression =
						await buildFilteredProjectCommentThreadsFilterExpression(
							ctx,
							{
								filtersSelection,
								linkedProjectLivePreview: where.linkedProjectLivePreview,
							},
						);

					return ctx.db.query('ProjectCommentThread')
						.withIndex(
							'by_linkedProjectLivePreview',
							(q) =>
								q.eq(
									'linkedProjectLivePreview',
									where.linkedProjectLivePreview,
								),
						)
						.filter(filterExpression)
						.order('desc')
						.paginate(paginationOpts);
				}
			}

			case 'project' in where: {
				// If there are no filters, then return all comments using a single index
				if (where.filtersSelection === null) {
					return ctx.db
						.query('ProjectCommentThread')
						.withIndex('by_project', (q) => q.eq('project', where.project))
						.order('desc')
						.paginate(paginationOpts);
				} else {
					const { filtersSelection } = where;
					const filterExpression =
						await buildFilteredProjectCommentThreadsFilterExpression(
							ctx,
							{
								filtersSelection,
								project: where.project,
							},
						);

					const paginationResult = await ctx.db.query('ProjectCommentThread')
						.withIndex(
							'by_project',
							(q) => q.eq('project', where.project),
						)
						.filter(filterExpression)
						.order('desc')
						.paginate(paginationOpts);

					return paginationResult;
				}
			}

			case 'organization' in where: {
				return getOrganizationProjectCommentThreads(where);
			}

			case 'organizationMember' in where: {
				const organizationMember = await ctx.db.get(where.organizationMember);
				if (organizationMember === null) {
					throw new Error('Organization member does not exist');
				}

				if (organizationMember.role !== 'guest') {
					return getOrganizationProjectCommentThreads({
						organization: organizationMember.organization,
						filtersSelection: where.filtersSelection,
					});
				}

				const authorizedProjects = (await ctx.db
					.query('OrganizationMemberAuthorizedProjectRelation')
					.withIndex(
						'by_organizationMember',
						(q) => q.eq('organizationMember', where.organizationMember),
					)
					.collect()).map((authorizedProjectRelation) =>
						authorizedProjectRelation.project
					);

				// If there are no filters, then return all comments using a single index
				if (where.filtersSelection === null) {
					return ctx.db
						.query('ProjectCommentThread')
						.withIndex(
							'by_organization',
							(q) => q.eq('organization', organizationMember.organization),
						)
						.filter((q) =>
							q.or(
								...authorizedProjects.map((authorizedProject) =>
									q.eq(q.field('project'), authorizedProject)
								),
							)
						)
						.order('desc')
						.paginate(paginationOpts);
				} else {
					const { filtersSelection } = where;
					const filterExpression =
						await buildFilteredProjectCommentThreadsFilterExpression(
							ctx,
							{
								filtersSelection,
								organizationMember: organizationMember._id,
							},
						);
					return ctx.db.query('ProjectCommentThread')
						.withIndex(
							'by_organization',
							(q) => q.eq('organization', organizationMember.organization),
						)
						.filter(filterExpression)
						.order('desc')
						.paginate(paginationOpts);
				}
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
		new UnexpectedError('while listing comment threads', { cause: error }),
);

export const ProjectCommentThread_list = listQuery(listHandler);
export const ProjectCommentThread_list_dashboardPageData = listQuery(
	listHandler,
	ProjectCommentThread_$dashboardPageData,
);
export const ProjectCommentThread_list_tunnelInstancePageToolbarData =
	listQuery(listHandler, ProjectCommentThread_$tunnelInstancePageToolbarData);

export const ProjectCommentThread_listFiltersChoices = protectedQuery(
	'ProjectCommentThread',
	{
		args: {
			input: v.union(
				v.object({ organization: v.id('Organization') }),
				v.object({ project: v.id('Project') }),
			),
		},
		async handler(ctx, { input }) {
			const projectCommentThreads = await (async () => {
				switch (true) {
					case 'organization' in input: {
						return ctx.db
							.query('ProjectCommentThread')
							.withIndex(
								'by_organization',
								(q) => q.eq('organization', input.organization),
							)
							.collect();
					}

					case 'project' in input: {
						return ctx.db
							.query('ProjectCommentThread')
							.withIndex(
								'by_project',
								(q) => q.eq('project', input.project),
							)
							.collect();
					}

					default: {
						return unreachableCase(
							input,
							`Invalid input: ${JSON.stringify(input)}`,
						);
					}
				}
			})();

			const projectIds = [
				...new Set(
					projectCommentThreads.map(
						(projectCommentThread) => projectCommentThread.project,
					),
				),
			];
			const authorUserIds = [
				...new Set(
					(
						await Promise.all(
							projectCommentThreads.map(async (projectCommentThread) => {
								const projectComment = await ctx.db
									.query('ProjectComment')
									.withIndex(
										'by_parentCommentThread',
										(q) =>
											q.eq('parentCommentThread', projectCommentThread._id),
									)
									.first();

								if (projectComment === null) {
									return null;
								}

								return projectComment.authorUser;
							}),
						)
					).filter(
						(authorUserId): authorUserId is Id<'User'> => authorUserId !== null,
					),
				),
			];

			const projects = (
				await Promise.all(
					projectIds.map(async (projectId) => ctx.db.get(projectId)),
				)
			).filter((project): project is Doc<'Project'> => project !== null);

			const authorUsers = (
				await Promise.all(
					authorUserIds.map(async (authorUserId) => {
						const authorUser = await ctx.db.get(authorUserId);

						if (authorUser === null) {
							return null;
						}

						return authorUser;
					}),
				)
			).filter((authorUser): authorUser is Doc<'User'> => authorUser !== null);

			return {
				oneOfProjectIds: projects.map((project) => ({
					name: project.name,
					value: project._id,
				})),
				oneOfAuthorUserIds: authorUsers.map((authorUser) => ({
					name: authorUser.fullName,
					value: authorUser._id,
				})),
			} satisfies {
				[$FilterKey in FilterKey]?: NormalizedFilterChoice[];
			};
		},
		error: (error) =>
			new UnexpectedError('while listing filters', { cause: error }),
	},
);

export const ProjectCommentThread_update = protectedMutation(
	'ProjectCommentThread',
	{
		args: {
			input: v.object({
				id: v.id('ProjectCommentThread'),
				updates: v.object({
					resolvedByUser: v.optional(vNullable(v.id('User'))),
					slackMetadata: v.optional(vNullable(slackCommentMetadataValidator)),
				}),
			}),
		},
		async handler(ctx, { input: { id, updates } }) {
			await dbPatch(ctx, 'ProjectCommentThread', id, updates, {
				unique: {},
			});
		},
		error: (error) =>
			new UnexpectedError('while updating the comment thread', {
				cause: error,
			}),
	},
);

export const ProjectCommentThread__delete = protectedMutation(
	'ProjectCommentThread',
	{
		args: {
			input: v.object({
				id: v.id('ProjectCommentThread'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			await dbDelete(ctx, 'ProjectCommentThread', id);
		},
		error: (error) =>
			new UnexpectedError('while deleting the comment thread', {
				cause: error,
			}),
	},
);
