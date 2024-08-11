import { v } from '@-/convex/values';
import type { SelectOutput } from '@-/database';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	dbPatch,
	defineMutation,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { getProjectCommentThreadIdSchema } from '@-/project-comment-thread/schemas';
import { getUserIdSchema } from '@-/user/schemas';
import { z } from '@-/zod';
import { unreachableCase } from '@tunnel/ts';
import { vNullable } from 'corvex';

export const ProjectComment__create = protectedMutation(
	'ProjectComment',
	{
		args: {
			input: v.object({
				data: v.object({
					parentCommentThread: v.id('ProjectCommentThread'),
					authorUser: v.id('User'),
					content: v.array(v.any()),
					authorInformation: v.optional(
						v.object({
							displayName: v.string(),
							displayProfileImageUrl: v.string(),
						}),
					),
					contentTextContent: v.string(),
					updatedAt: v.number(),
					slackMetadata: vNullable(
						v.object({
							messageTS: v.string(),
							userId: v.string(),
						}),
					),
					sentBySlack: v.boolean(),
				}),
				files: v.array(v.id('File')),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, files, include } }) {
			const parentCommentThread = await ctx.db.get(data.parentCommentThread);

			if (parentCommentThread === null) {
				throw new Error('Parent comment thread not found');
			}

			const project = await ctx.db.get(parentCommentThread.project);
			if (project === null) {
				throw new Error('Project not found');
			}

			const id = await dbInsert(
				ctx,
				'ProjectComment',
				{
					...data,
					project: parentCommentThread.project,
					organization: project.organization,
					authorInformation: data.authorInformation ?? null,
				},
				{ unique: {} },
			);

			for (const fileId of files) {
				// eslint-disable-next-line no-await-in-loop -- todo
				await ctx.db.patch(fileId, {
					projectComment: id,
				});
			}

			return applyInclude(ctx, 'ProjectComment', id, include);
		},
		error: (error) =>
			new UnexpectedError('while creating the comment', { cause: error }),
	},
);

export const ProjectComment_insert = defineMutation({
	table: 'ProjectComment',
	input: v.object({
		data: v.object({
			parentCommentThread: v.id('ProjectCommentThread'),
			authorUser: v.id('User'),
			content: v.array(v.any()),
			authorInformation: v.optional(
				v.object({
					displayName: v.string(),
					displayProfileImageUrl: v.string(),
				}),
			),
			contentTextContent: v.string(),
			updatedAt: v.number(),
			slackMetadata: vNullable(
				v.object({
					messageTS: v.string(),
					userId: v.string(),
				}),
			),
			sentBySlack: v.boolean(),
		}),
	}),
	schema: (ctx, args) =>
		z.object({
			data: z.object({
				parentCommentThread: getProjectCommentThreadIdSchema(ctx, {}),
				authorUser: getUserIdSchema(ctx, args, {
					actorRelation: 'actor',
				}),
				content: z.array(z.any()),
				authorInformation: z
					.object({
						displayName: z.string(),
						displayProfileImageUrl: z.string(),
					})
					.optional(),
				contentTextContent: z.string(),
				updatedAt: z.number(),
				slackMetadata: z.nullable(
					z.object({
						messageTS: z.string(),
						userId: z.string(),
					}),
				),
				sentBySlack: z.boolean(),
			}),
		}),
	async handler(ctx, { input: { data } }) {
		const parentCommentThread = await ctx.db.get(data.parentCommentThread);

		if (parentCommentThread === null) {
			throw new Error('Parent comment thread not found');
		}

		const project = await ctx.db.get(parentCommentThread.project);
		if (project === null) {
			throw new Error('Project not found');
		}

		const id = await dbInsert(
			ctx,
			'ProjectComment',
			{
				...data,
				project: parentCommentThread.project,
				organization: project.organization,
				authorInformation: data.authorInformation ?? null,
			},
			{ unique: {} },
		);

		return (await applyInclude(ctx, 'ProjectComment', id, {})) as SelectOutput<
			'ProjectComment',
			{}
		>;
	},
	error: (error) =>
		new UnexpectedError('while creating the comment', { cause: error }),
});

export const ProjectComment_update = protectedMutation(
	'ProjectComment',
	{
		args: {
			input: v.object({
				id: v.id('ProjectComment'),
				updates: v.object({
					content: v.optional(v.array(v.any())),
				}),
			}),
		},
		async handler(ctx, { input: { id, updates } }) {
			await dbPatch(ctx, 'ProjectComment', id, updates, {
				unique: {},
			});
		},
		error: (error) =>
			new UnexpectedError('while updating the comment', { cause: error }),
	},
);

export const ProjectComment_get = protectedQuery(
	'ProjectComment',
	{
		args: {
			from: v.union(
				v.object({ id: v.id('ProjectComment') }),
				v.object({ slackMessageTS: v.string(), slackId: v.string() }),
			),
			include: vInclude(),
		},
		async handler(ctx, { from, include }) {
			switch (true) {
				case 'id' in from: {
					return applyInclude(ctx, 'ProjectComment', from.id, include);
				}

				case 'slackMessageTS' in from && 'slackId' in from: {
					return applyInclude(
						ctx,
						'ProjectComment',
						await ctx.db
							.query('ProjectComment')
							.withIndex(
								'by_slackMessage',
								(q) =>
									q
										.eq('slackMetadata.messageTS', from.slackMessageTS)
										.eq(
											'slackMetadata.userId',
											from.slackId,
										),
							)
							.first(),
						include,
					);
				}

				default: {
					return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
				}
			}
		},
		error: (error) =>
			new UnexpectedError('while retrieving the comment', { cause: error }),
	},
);

export const ProjectComment_getFirstInThread = protectedQuery(
	'ProjectComment',
	{
		args: {
			projectCommentThreadId: v.id('ProjectCommentThread'),
			include: vInclude(),
		},
		async handler(ctx, { projectCommentThreadId, include }) {
			const comment = await ctx.db
				.query('ProjectComment')
				.withIndex(
					'by_parentCommentThread',
					(q) => q.eq('parentCommentThread', projectCommentThreadId),
				)
				.order('asc')
				.first();

			if (!comment) {
				return null;
			}

			return applyInclude(ctx, 'ProjectComment', comment, include);
		},
		error: (error) =>
			new UnexpectedError('while retrieving the first comment', {
				cause: error,
			}),
	},
);

export const ProjectComment_list = protectedQuery(
	'ProjectComment',
	{
		args: {
			where: v.union(
				v.object({
					projectCommentThread: v.id('ProjectCommentThread'),
				}),
				v.object({
					organization: v.id('Organization'),
					text: v.string(),
				}),
				v.object({
					project: v.id('Project'),
					text: v.string(),
				}),
			),
			include: vInclude(),
		},
		async handler(ctx, { where, include }) {
			switch (true) {
				case 'projectCommentThread' in where: {
					return applyInclude(
						ctx,
						'ProjectComment',
						await ctx.db
							.query('ProjectComment')
							.withIndex(
								'by_parentCommentThread',
								(q) => q.eq('parentCommentThread', where.projectCommentThread),
							)
							.collect(),
						include,
					);
				}

				case 'organization' in where: {
					return applyInclude(
						ctx,
						'ProjectComment',
						await ctx.db
							.query('ProjectComment')
							.withSearchIndex('search_contentTextContent', (q) =>
								q
									.search('contentTextContent', where.text)
									.eq('organization', where.organization))
							.collect(),
						include,
					);
				}

				case 'project' in where: {
					return applyInclude(
						ctx,
						'ProjectComment',
						await ctx.db
							.query('ProjectComment')
							.withSearchIndex('search_contentTextContent', (q) =>
								q
									.search('contentTextContent', where.text)
									.eq('project', where.project))
							.collect(),
						include,
					);
				}

				default: {
					return unreachableCase(
						where,
						`Invalid where: ${JSON.stringify(where)}`,
					);
				}
			}
		},
		error: (error) =>
			new UnexpectedError('while listing comments', { cause: error }),
	},
);

export const ProjectComment_delete = protectedMutation(
	'ProjectComment',
	{
		args: {
			input: v.object({
				id: v.id('ProjectComment'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			await dbDelete(ctx, 'ProjectComment', id);
		},
		error: (error) =>
			new UnexpectedError('while deleting the comment', { cause: error }),
	},
);
