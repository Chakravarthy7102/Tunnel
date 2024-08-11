import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
	protectedQuery,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';
import { unreachableCase } from '@tunnel/ts';

export const ProjectSlackMessage_create = protectedMutation(
	'ProjectSlackMessage',
	{
		args: {
			input: v.object({
				data: v.object({
					project: v.id('Project'),
					organization: v.id('Organization'),
					channelId: v.string(),
					messageId: v.string(),
					permalink: v.string(),
					channelName: v.string(),
				}),
			}),
		},
		async handler(ctx, { input: { data } }) {
			const _id = await dbInsert(ctx, 'ProjectSlackMessage', data, {
				unique: {},
			});
			return _id;
		},
		error: (error) =>
			new UnexpectedError('while creating the slack message', { cause: error }),
	},
);

export const ProjectSlackMessage_get = protectedQuery(
	'ProjectSlackMessage',
	{
		args: {
			from: v.union(
				v.object({ id: v.id('ProjectSlackMessage') }),
				v.object({ messageId: v.string() }),
			),
			include: vInclude(),
		},
		async handler(ctx, { from, include }) {
			switch (true) {
				case 'id' in from: {
					return applyInclude(ctx, 'ProjectSlackMessage', from.id, include);
				}

				case 'messageId' in from: {
					return applyInclude(
						ctx,
						'ProjectSlackMessage',
						await ctx.db
							.query('ProjectSlackMessage')
							.withIndex(
								'by_messageId',
								(q) => q.eq('messageId', from.messageId),
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
			new UnexpectedError('while retrieving the slack message', {
				cause: error,
			}),
	},
);
