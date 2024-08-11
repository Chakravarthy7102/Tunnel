import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const ProjectAsanaTaskTag = table(
	'ProjectAsanaTaskTag',
	v.object({
		projectAsanaTask: v.id('ProjectAsanaTask'),
		organization: v.id('Organization'),
		name: v.string(),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organization', ['organization'])
			.index('by_name', ['name'])
			.index('by_projectAsanaTask', ['projectAsanaTask']),
)({
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	projectAsanaTask: {
		foreignTable: 'ProjectAsanaTask',
		hostIndex: 'by_projectAsanaTask',
		onDelete: 'Cascade',
	},
});
