import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const OrganizationMemberAuthorizedProjectRelation = table(
	'OrganizationMemberAuthorizedProjectRelation',
	v.object({
		organizationMember: v.id('OrganizationMember'),
		project: v.id('Project'),
		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organizationMember', ['organizationMember'])
			.index('by_project', ['project'])
			.index('by_organizationMember_project', [
				'organizationMember',
				'project',
			]),
)({
	organizationMember: {
		foreignTable: 'OrganizationMember',
		hostIndex: 'by_organizationMember',
		onDelete: 'Cascade',
	},
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
});
