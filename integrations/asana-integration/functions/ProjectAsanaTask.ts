import {
	asanaAssigneeValidator,
	// asanaParentTaskValidator,
	asanaProjectValidator,
	asanaSectionValidator,
} from '#validators/asana.ts';
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
import { vNullable } from 'corvex';

export const ProjectAsanaTask_create = protectedMutation(
	'ProjectAsanaTask',
	{
		args: {
			input: v.object({
				data: v.object({
					project: v.id('Project'),
					organization: v.id('Organization'),
					gid: v.string(),
					asanaProject: vNullable(asanaProjectValidator),
					url: v.string(),
					section: vNullable(asanaSectionValidator),
					assignee: vNullable(asanaAssigneeValidator),
					parentTask: v.null(),
				}),
			}),
		},
		async handler(ctx, { input: { data } }) {
			const _id = await dbInsert(ctx, 'ProjectAsanaTask', data, {
				unique: {},
			});
			return _id;
		},
		error: (error) =>
			new UnexpectedError('while creating the project asana issue', {
				cause: error,
			}),
	},
);

export const ProjectAsanaTask_get = protectedQuery(
	'ProjectAsanaTask',
	{
		args: {
			from: v.object({ id: v.id('ProjectAsanaTask') }),
			include: vInclude(),
		},
		async handler(ctx, { from, include }) {
			switch (true) {
				case 'id' in from: {
					return applyInclude(ctx, 'ProjectAsanaTask', from.id, include);
				}

				default: {
					return unreachableCase(from, `Invalid from: ${JSON.stringify(from)}`);
				}
			}
		},
		error: (error) =>
			new UnexpectedError('while retrieving the project asana issue', {
				cause: error,
			}),
	},
);
