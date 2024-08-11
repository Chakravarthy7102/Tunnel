import { v } from '@-/convex/values';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	dbPatch,
	defineGetHandler,
	protectedGetQuery,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { TunnelInstanceProxyPreview_$tunnelInstancePageToolbarData } from '@-/database/selections';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { unreachableCase } from '@tunnel/ts';
import { vNullable } from 'corvex';

export const TunnelInstanceProxyPreview__create = protectedMutation(
	'TunnelInstanceProxyPreview',
	{
		args: {
			input: v.object({
				data: v.object({
					gitUrl: vNullable(v.string()),
					project: v.id('Project'),
					localUrl: vNullable(v.string()),
					projectPath: vNullable(v.string()),
					updatedAt: v.number(),
					createdByUser: v.id('User'),
					localServicePortNumber: v.number(),
					allowedPortNumbers: v.array(v.number()),
					disallowedPortNumbers: v.array(v.number()),
					localServiceOriginalPortNumber: v.number(),
					localTunnelProxyServerPortNumber: v.number(),
					isActive: v.boolean(),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const project = await ctx.db.get(data.project);
			if (project === null) {
				throw new Error(`Project with ID ${project} does not exist`);
			}

			const id = await dbInsert(
				ctx,
				'TunnelInstanceProxyPreview',
				{ ...data, organization: project.organization },
				{ unique: {} },
			);
			return applyInclude(ctx, 'TunnelInstanceProxyPreview', id, include);
		},
		error: (error) =>
			new UnexpectedError('while creating the tunnel instance proxy preview', {
				cause: error,
			}),
	},
);

const getHandler = defineGetHandler(
	'TunnelInstanceProxyPreview',
	{
		from: v.object({ id: v.id('TunnelInstanceProxyPreview') }),
	},
	async (ctx, { from }) => {
		switch (true) {
			case 'id' in from: {
				return from.id;
			}

			default: {
				return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
			}
		}
	},
	(error) =>
		new UnexpectedError(
			'while retrieving the tunnel instance proxy preview',
			{ cause: error },
		),
);

export const TunnelInstanceProxyPreview_get = protectedGetQuery(getHandler);
export const TunnelInstanceProxyPreview_get_tunnelInstancePageToolbarData =
	protectedGetQuery(
		getHandler,
		TunnelInstanceProxyPreview_$tunnelInstancePageToolbarData,
	);

export const TunnelInstanceProxyPreview_list = protectedQuery(
	'TunnelInstanceProxyPreview',
	{
		args: {
			where: v.union(
				v.object({
					inOrganization: v.id('Organization'),
				}),
				v.object({
					inProject: v.id('Project'),
					createdByUser: v.optional(v.id('User')),
				}),
			),
			include: vInclude(),
		},
		async handler(ctx, { where, include }) {
			switch (true) {
				case 'inOrganization' in where: {
					const projectsInOrganization = await ctx.db
						.query('Project')
						.withIndex(
							'by_organization',
							(q) => q.eq('organization', where.inOrganization),
						)
						.collect();

					return applyInclude(
						ctx,
						'TunnelInstanceProxyPreview',
						(
							await Promise.all(
								projectsInOrganization.map(async (project) =>
									ctx.db
										.query('TunnelInstanceProxyPreview')
										.withIndex(
											'by_project',
											(q) => q.eq('project', project._id),
										)
										.collect()
								),
							)
						).flat(),
						include,
					);
				}

				case 'inProject' in where: {
					const { createdByUser } = where;

					if (createdByUser === undefined) {
						return applyInclude(
							ctx,
							'TunnelInstanceProxyPreview',
							await ctx.db
								.query('TunnelInstanceProxyPreview')
								.withIndex(
									'by_project',
									(q) => q.eq('project', where.inProject),
								)
								.collect(),
							include,
						);
					} else {
						return applyInclude(
							ctx,
							'TunnelInstanceProxyPreview',
							await ctx.db
								.query('TunnelInstanceProxyPreview')
								.withIndex('by_createdByUser_project', (q) =>
									q
										.eq('createdByUser', createdByUser)
										.eq('project', where.inProject))
								.collect(),
							include,
						);
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
		error: (error) =>
			new UnexpectedError('while listing tunnel instance proxy previews', {
				cause: error,
			}),
	},
);

export const TunnelInstanceProxyPreview_count = protectedQuery(
	'TunnelInstanceProxyPreview',
	{
		args: {
			where: v.object({ createdByUser: v.id('User') }),
		},
		async handler(ctx, { where }) {
			const documents = await ctx.db
				.query('TunnelInstanceProxyPreview')
				.withIndex(
					'by_createdByUser',
					(q) => q.eq('createdByUser', where.createdByUser),
				)
				.collect();
			return documents.length;
		},
		error: (error) =>
			new UnexpectedError('while counting tunnel instance proxy previews', {
				cause: error,
			}),
	},
);

export const TunnelInstanceProxyPreview_update = protectedMutation(
	'TunnelInstanceProxyPreview',
	{
		args: {
			input: v.object({
				id: v.id('TunnelInstanceProxyPreview'),
				updates: v.object({
					gitUrl: v.optional(vNullable(v.string())),
					projectPath: v.optional(vNullable(v.string())),
					allowedPortNumbers: v.optional(v.array(v.number())),
					disallowedPortNumbers: v.optional(v.array(v.number())),
					localServicePortNumber: v.optional(v.number()),
					localServiceOriginalPortNumber: v.optional(v.number()),
					localTunnelProxyServerPortNumber: v.optional(v.number()),
					isActive: v.optional(v.boolean()),
				}),
			}),
		},
		async handler(ctx, { input: { id, updates } }) {
			await dbPatch(ctx, 'TunnelInstanceProxyPreview', id, updates, {
				unique: {},
			});
		},
		error: (error) =>
			new UnexpectedError('while updating the tunnel instance proxy preview', {
				cause: error,
			}),
	},
);

export const TunnelInstanceProxyPreview_delete = protectedMutation(
	'TunnelInstanceProxyPreview',
	{
		args: {
			input: v.object({
				id: v.id('TunnelInstanceProxyPreview'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			await dbDelete(ctx, 'TunnelInstanceProxyPreview', id);
		},
		error: (error) =>
			new UnexpectedError('while deleting the tunnel instance proxy preview', {
				cause: error,
			}),
	},
);
