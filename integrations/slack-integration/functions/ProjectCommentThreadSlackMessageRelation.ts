import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';

export const ProjectCommentThreadSlackMessageRelation_create =
	protectedMutation(
		'ProjectCommentThreadSlackMessageRelation',
		{
			args: {
				input: v.object({
					data: v.object({
						projectCommentThread: v.id('ProjectCommentThread'),
						projectSlackMessage: v.id('ProjectSlackMessage'),
					}),
					include: vInclude(),
				}),
			},
			async handler(ctx, { input: { data, include } }) {
				const id = await dbInsert(
					ctx,
					'ProjectCommentThreadSlackMessageRelation',
					{ ...data, type: 'created' },
					{ unique: {} },
				);

				return applyInclude(
					ctx,
					'ProjectCommentThreadSlackMessageRelation',
					id,
					include,
				);
			},
			error: (error) =>
				new UnexpectedError(
					'while associating the project comment thread with the slack message',
					{ cause: error },
				),
		},
	);
