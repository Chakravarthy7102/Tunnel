import {
	asanaAssigneeValidator,
	// asanaParentTaskValidator,
	asanaProjectValidator,
	asanaSectionValidator,
} from '#validators/asana.ts';
import { v } from '@-/convex/values';
import type * as $ from '@-/database/tables';
import {
	table,
	vDeprecated,
	virtualArray,
	vNew,
	vNullable,
	vVirtualArray,
} from 'corvex';

export const ProjectAsanaTask = table(
	'ProjectLinearIssue',
	v.object({
		project: v.id('Project'),
		organization: v.id('Organization'),
		// Asana Task data
		gid: v.string(),
		url: v.string(),
		asanaProject: vNew(vNullable(asanaProjectValidator)),
		section: vNew(vNullable(asanaSectionValidator)),
		assignee: vNew(vNullable(asanaAssigneeValidator)),
		tags: vVirtualArray('ProjectAsanaTaskTag'),
		parentTask: vNew(v.null()),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_project', ['project'])
			.index('by_organization', ['organization'])
			.index('by_gid', ['gid'])
			.index('by_asanaProjectId', ['asanaProject.gid'])
			.index('by_sectionId', ['section.gid'])
			.index('by_assigneeId', ['assignee.gid'])
			// .index('by_parentTaskId', ['parentTask.gid'])
			.index('by_projectAsanaTaskTag', ['tags']),
)({
	asanaProject: { default: () => null },
	assignee: { default: () => null },
	section: { default: () => null },
	// @ts-expect-error: broken corvex types with null literal
	parentTask: { default: () => null },
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
	organization: {
		foreignTable: 'Organization',
		hostIndex: 'by_organization',
		onDelete: 'Cascade',
	},
	tags: virtualArray<typeof $.ProjectAsanaTaskTag>(
		'ProjectAsanaTaskTag',
		'by_projectAsanaTask',
	),
});
