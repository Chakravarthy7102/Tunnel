import { v } from '@-/convex/values';
import {
	applyInclude,
	dbDelete,
	dbInsert,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { unreachableCase } from '@tunnel/ts';
import { vNullable } from 'corvex';

export const OrganizationMemberSlackSubscription_create = protectedMutation(
	'OrganizationMemberSlackSubscription',
	{
		args: {
			input: v.object({
				data: v.object({
					organization: v.id('Organization'),
					project: vNullable(v.id('Project')),
					organizationMember: v.id('OrganizationMember'),
					channelId: v.string(),
					channelName: v.string(),
				}),
			}),
		},
		async handler(ctx, { input: { data } }) {
			const _id = await dbInsert(
				ctx,
				'OrganizationMemberSlackSubscription',
				data,
				{
					unique: {},
				},
			);
			return _id;
		},
		error: (error) =>
			new UnexpectedError(
				'while creating the organization member slack subscription',
				{ cause: error },
			),
	},
);

export const OrganizationMemberSlackSubscription_get = protectedQuery(
	'OrganizationMemberSlackSubscription',
	{
		args: {
			from: v.object({ id: v.id('OrganizationMemberSlackSubscription') }),
			include: vInclude(),
		},
		async handler(ctx, { from, include }) {
			switch (true) {
				case 'id' in from: {
					return applyInclude(
						ctx,
						'OrganizationMemberSlackSubscription',
						from.id,
						include,
					);
				}

				default: {
					return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
				}
			}
		},
		error: (error) =>
			new UnexpectedError(
				'while getting the organization member slack subscription',
				{ cause: error },
			),
	},
);

export const OrganizationMemberSlackSubscription_list = protectedQuery(
	'OrganizationMemberSlackSubscription',
	{
		args: {
			where: v.union(
				v.object({ organization: v.id('Organization') }),
				v.object({ project: v.id('Project') }),
				v.object({ organizationMember: v.id('OrganizationMember') }),
				v.object({ channelId: v.string() }),
			),
			include: vInclude(),
		},
		async handler(ctx, { where, include }) {
			switch (true) {
				case 'organization' in where: {
					return applyInclude(
						ctx,
						'OrganizationMemberSlackSubscription',
						await ctx.db
							.query('OrganizationMemberSlackSubscription')
							.withIndex(
								'by_organization',
								(q) => q.eq('organization', where.organization),
							)
							.collect(),
						include,
					);
				}

				case 'project' in where: {
					return applyInclude(
						ctx,
						'OrganizationMemberSlackSubscription',
						await ctx.db
							.query('OrganizationMemberSlackSubscription')
							.withIndex(
								'by_project',
								(q) => q.eq('project', where.project),
							)
							.collect(),
						include,
					);
				}

				case 'organizationMember' in where: {
					return applyInclude(
						ctx,
						'OrganizationMemberSlackSubscription',
						await ctx.db
							.query('OrganizationMemberSlackSubscription')
							.withIndex(
								'by_organizationMember',
								(q) => q.eq('organizationMember', where.organizationMember),
							)
							.collect(),
						include,
					);
				}

				case 'channelId' in where: {
					return applyInclude(
						ctx,
						'OrganizationMemberSlackSubscription',
						await ctx.db
							.query('OrganizationMemberSlackSubscription')
							.withIndex(
								'by_channelId',
								(q) => q.eq('channelId', where.channelId),
							)
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
			new UnexpectedError(
				'while listing organization member slack subscriptions',
				{ cause: error },
			),
	},
);

export const OrganizationMemberSlackSubscription_delete = protectedMutation(
	'OrganizationMemberSlackSubscription',
	{
		args: {
			input: v.object({
				id: v.id('OrganizationMemberSlackSubscription'),
			}),
		},
		async handler(ctx, { input: { id } }) {
			await dbDelete(ctx, 'OrganizationMemberSlackSubscription', id);
		},
		error: (error) =>
			new UnexpectedError(
				'while deleting the organization member slack subscription',
				{ cause: error },
			),
	},
);
