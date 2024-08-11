import { v } from '@-/convex/values';
import { table, vDeprecated } from 'corvex';

export const OrganizationInvitationAuthorizedProjectRelation = table(
	'OrganizationInvitationAuthorizedProjectRelation',
	v.object({
		organizationInvitation: v.id('OrganizationInvitation'),
		project: v.id('Project'),

		cid: vDeprecated<string>('Use `_id` instead'),
	}),
	(t) =>
		t
			.index('by_cid', ['cid'])
			.index('by_organizationInvitation', ['organizationInvitation'])
			.index('by_project', ['project'])
			.index('by_organizationInvitation_project', [
				'organizationInvitation',
				'project',
			]),
)({
	organizationInvitation: {
		foreignTable: 'OrganizationInvitation',
		hostIndex: 'by_organizationInvitation',
		onDelete: 'Cascade',
	},
	project: {
		foreignTable: 'Project',
		hostIndex: 'by_project',
		onDelete: 'Cascade',
	},
});
