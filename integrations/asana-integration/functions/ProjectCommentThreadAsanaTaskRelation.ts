import { v } from '@-/convex/values';
import {
	applyInclude,
	dbInsert,
	protectedMutation,
} from '@-/database/function-utils';
import { vInclude } from '@-/database/validators';
import { UnexpectedError } from '@-/errors';

export const ProjectCommentThreadAsanaTaskRelation_create = protectedMutation(
	'ProjectCommentThreadAsanaTaskRelation',
	{
		args: {
			input: v.object({
				data: v.object({
					projectCommentThread: v.id('ProjectCommentThread'),
					projectAsanaTask: v.id('ProjectAsanaTask'),
				}),
				include: vInclude(),
			}),
		},
		async handler(ctx, { input: { data, include } }) {
			const id = await dbInsert(
				ctx,
				'ProjectCommentThreadAsanaTaskRelation',
				{ ...data, type: 'created' },
				{ unique: {} },
			);

			return applyInclude(
				ctx,
				'ProjectCommentThreadAsanaTaskRelation',
				id,
				include,
			);
		},
		error: (error) =>
			new UnexpectedError(
				'while associating the project comment thread with the asana task',
				{ cause: error },
			),
	},
);
