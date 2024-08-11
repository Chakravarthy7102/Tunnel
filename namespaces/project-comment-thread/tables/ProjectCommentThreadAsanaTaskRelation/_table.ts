import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const ProjectCommentThreadAsanaTaskRelation = table(
	'ProjectCommentThreadAsanaTaskRelation',
	v.object({
		type: v.literal('created'),
		projectCommentThread: v.id('ProjectCommentThread'),
		projectAsanaTask: v.id('ProjectAsanaTask'),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_projectCommentThread', ['projectCommentThread'])
			.index('by_projectAsanaTask', ['projectAsanaTask']),
)({
	projectCommentThread: {
		foreignTable: 'ProjectCommentThread',
		hostIndex: 'by_projectCommentThread',
		onDelete: 'Cascade',
	},
	projectAsanaTask: {
		foreignTable: 'ProjectAsanaTask',
		hostIndex: 'by_projectAsanaTask',
		onDelete: 'Cascade',
	},
});
