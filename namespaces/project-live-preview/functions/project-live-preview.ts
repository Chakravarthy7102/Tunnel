import { v } from '@-/convex/values';
import { createCid, type Id, type MutationCtx } from '@-/database';
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
import {
	ProjectLivePreview_$dashboardPageData,
	ProjectLivePreview_$tunnelInstancePageToolbarData,
} from '@-/database/selections';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { unreachableCase } from '@tunnel/ts';
import { vNullable } from 'corvex';

async function createProjectLivePreview(ctx: MutationCtx, args: {
	project: Id<'Project'>;
	url: string;
	isLive: boolean;
	createdByUser: Id<'User'>;
	linkedTunnelInstanceProxyPreview: Id<'TunnelInstanceProxyPreview'> | null;
}) {
	const project = await ctx.db.get(args.project);
	if (project === null) {
		throw new Error(`Project ${project} not found`);
	}

	const slug = createCid();

	const projectLivePreviewId = await dbInsert(
		ctx,
		'ProjectLivePreview',
		{
			...args,
			slug,
			organization: project.organization,
			allowsAnonymousUsers: false,
			dailyRoomName: slug,
			liveshareLink: null,
			viewPermission: 'anyoneWithLink',
		},
		{
			unique: args.url.endsWith('.tunnelapp.dev') ?
				{ by_url: ['url'] } :
				{ by_project_url: ['project', 'url'] },
		},
	);

	return projectLivePreviewId;
}

export const ProjectLivePreview__create = protectedMutation(
	'ProjectLivePreview',
	{
		args: {
			input: v.object({
				projectLivePreview: v.object({
					liveshareLink: vNullable(v.string()),
					dailyRoomName: v.string(),
					viewPermission: v.string(),
					project: v.id('Project'),
					linkedTunnelInstanceProxyPreview: vNullable(
						v.id('TunnelInstanceProxyPreview'),
					),
					url: v.string(),
					isLive: v.boolean(),
					createdByUser: v.id('User'),
				}),
				include: vInclude(),
			}),
		},
		async handler(
			ctx,
			{ input: { projectLivePreview, include } },
		) {
			const projectLivePreviewId = await createProjectLivePreview(ctx, {
				...projectLivePreview,
			});

			return applyInclude(
				ctx,
				'ProjectLivePreview',
				projectLivePreviewId,
				include,
			);
		},
		error: (error) =>
			new UnexpectedError('while creating the project live preview', {
				cause: error,
			}),
	},
);

const getHandler = defineGetHandler(
	'ProjectLivePreview',
	{
		from: v.union(
			v.object({ id: v.id('ProjectLivePreview') }),
			v.object({ slug: v.string() }),
			v.object({ tunnelappUrl: v.string() }),
			v.object({ publicUrl: v.string(), project: v.id('Project') }),
		),
	},
	async (ctx, { from }) => {
		switch (true) {
			case 'id' in from: {
				return from.id;
			}

			case 'slug' in from: {
				return (
					await ctx.db
						.query('ProjectLivePreview')
						.withIndex('by_slug', (q) => q.eq('slug', from.slug))
						.first() ??
						ctx.db.query('ProjectLivePreview').withIndex(
							'by_cid',
							(q) => q.eq('cid', from.slug),
						).first()
				);
			}

			case 'tunnelappUrl' in from: {
				if (!from.tunnelappUrl.endsWith('.tunnelapp.dev')) {
					return null;
				}

				return ctx.db
					.query('ProjectLivePreview')
					.withIndex('by_url', (q) => q.eq('url', from.tunnelappUrl))
					.first();
			}

			case 'publicUrl' in from && 'project' in from: {
				return ctx.db.query('ProjectLivePreview')
					.withIndex(
						'by_project_url',
						(q) => q.eq('project', from.project).eq('url', from.publicUrl),
					)
					.first();
			}

			default: {
				return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
			}
		}
	},
	(error) =>
		new UnexpectedError('while getting the project live preview', {
			cause: error,
		}),
);

export const ProjectLivePreview_get = protectedGetQuery(getHandler);
export const ProjectLivePreview_get_dashboardPageData = protectedGetQuery(
	getHandler,
	ProjectLivePreview_$dashboardPageData,
);
export const ProjectLivePreview_get_tunnelInstancePageToolbarData =
	protectedGetQuery(
		getHandler,
		ProjectLivePreview_$tunnelInstancePageToolbarData,
	);

export const ProjectLivePreview_ensure = protectedMutation(
	'ProjectLivePreview',
	{
		args: {
			input: v.object({
				projectLivePreview: v.object({
					project: v.id('Project'),
					url: v.string(),
					isLive: v.boolean(),
					createdByUser: v.id('User'),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { projectLivePreview, include } }) {
			const existingProjectLivePreview = await ctx.db.query(
				'ProjectLivePreview',
			).withIndex(
				'by_project_url',
				(q) =>
					q.eq('project', projectLivePreview.project).eq(
						'url',
						projectLivePreview.url,
					),
			).first();

			if (existingProjectLivePreview !== null) {
				return applyInclude(
					ctx,
					'ProjectLivePreview',
					existingProjectLivePreview._id,
					include,
				);
			}

			const projectLivePreviewId = await createProjectLivePreview(
				ctx,
				{ ...projectLivePreview, linkedTunnelInstanceProxyPreview: null },
			);

			return applyInclude(
				ctx,
				'ProjectLivePreview',
				projectLivePreviewId,
				include,
			);
		},
		error: (error) =>
			new UnexpectedError('while ensuring the project live preview', {
				cause: error,
			}),
	},
);

export const ProjectLivePreview_list = protectedQuery(
	'ProjectLivePreview',
	{
		args: {
			where: v.union(
				v.object({ inProject: v.id('Project') }),
				v.object({ organizationMember: v.id('OrganizationMember') }),
				v.object({
					linkedTunnelInstanceProxyPreview: v.id('TunnelInstanceProxyPreview'),
				}),
			),
			include: vInclude(),
		},
		async handler(ctx, { where, include }) {
			switch (true) {
				case 'inProject' in where: {
					return applyInclude(
						ctx,
						'ProjectLivePreview',
						await ctx.db
							.query('ProjectLivePreview')
							.withIndex('by_project', (q) => q.eq('project', where.inProject))
							.collect(),
						include,
					);
				}

				case 'organizationMember' in where: {
					const organizationMember = await ctx.db.get(where.organizationMember);

					if (organizationMember === null) {
						throw new Error(
							`Organization member ${where.organizationMember} not found`,
						);
					}

					const projects = await (async () => {
						if (organizationMember.role === 'guest') {
							const authorizedProjects = (await ctx.db
								.query('OrganizationMemberAuthorizedProjectRelation').withIndex(
									'by_organizationMember',
									(q) => q.eq('organizationMember', organizationMember._id),
								).collect()).map((relation) => relation.project);

							return ctx.db
								.query('Project')
								.withIndex(
									'by_organization',
									(q) => q.eq('organization', organizationMember.organization),
								)
								.filter((q) =>
									q.or(
										...authorizedProjects.map((authorizedProject) =>
											q.eq(q.field('_id'), authorizedProject)
										),
									)
								)
								.collect();
						} else {
							return ctx.db
								.query('Project')
								.withIndex(
									'by_organization',
									(q) => q.eq('organization', organizationMember.organization),
								)
								.collect();
						}
					})();

					return applyInclude(
						ctx,
						'ProjectLivePreview',
						(
							await Promise.all(
								projects.map(async (project) =>
									ctx.db
										.query('ProjectLivePreview')
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

				case 'linkedTunnelInstanceProxyPreview' in where: {
					return applyInclude(
						ctx,
						'ProjectLivePreview',
						await ctx.db
							.query('ProjectLivePreview')
							.withIndex('by_linkedTunnelInstanceProxyPreview', (q) =>
								q.eq(
									'linkedTunnelInstanceProxyPreview',
									where.linkedTunnelInstanceProxyPreview,
								))
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
			new UnexpectedError('while listing project live previews', {
				cause: error,
			}),
	},
);

export const ProjectLivePreview_update = protectedMutation(
	'ProjectLivePreview',
	{
		args: {
			input: v.object({
				id: v.id('ProjectLivePreview'),
				updates: v.object({
					dailyRoomName: v.optional(v.string()),
					liveshareLink: v.optional(vNullable(v.string())),
					viewPermission: v.optional(v.string()),
					url: v.optional(v.string()),
				}),
			}),
		},
		async handler(ctx, { input: { id, updates } }) {
			await dbPatch(ctx, 'ProjectLivePreview', id, updates, {
				unique: updates.url?.endsWith('.tunnelapp.dev') ?
					{ by_url: ['url'] } :
					{ by_project_url: ['project', 'url'] },
			});
		},
		error: (error) =>
			new UnexpectedError('while updating the project live preview', {
				cause: error,
			}),
	},
);

export const ProjectLivePreview_delete = protectedMutation(
	'ProjectLivePreview',
	{
		args: {
			input: v.object({
				id: v.id('ProjectLivePreview'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			await dbDelete(ctx, 'ProjectLivePreview', id);
		},
		error: (error) =>
			new UnexpectedError('while deleting the project live preview', {
				cause: error,
			}),
	},
);
