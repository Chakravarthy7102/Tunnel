import type { OrganizationMemberRole } from '#types';
import type { Id, MutationCtx } from '@-/database';
import { dbInsert } from '@-/database/function-utils';

export async function insertOrganizationMember(
	ctx: MutationCtx,
	data: {
		workosOrganizationMembershipId: string;
		organization: Id<'Organization'>;
		role: OrganizationMemberRole;
		user: Id<'User'>;
	},
): Promise<Id<'OrganizationMember'>> {
	const organization = await ctx.db.get(data.organization);
	if (organization === null) {
		throw new Error(`Organization not found: ${data.organization}`);
	}

	const id = await dbInsert(
		ctx,
		'OrganizationMember',
		data,
		{
			unique: {
				by_organization_user: ['organization', 'user'],
			},
		},
	);

	await ctx.db.patch(organization._id, {
		membersCount: (organization.membersCount ?? 0) + 1,
	});

	return id;
}
