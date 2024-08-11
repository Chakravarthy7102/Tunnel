import type { FixtureKeyOfType } from '#types';
import { defineFixture } from '#utils/define.ts';
import { ApiConvex } from '@-/convex/api';
import type { DocBase } from '@-/database';
import type { OrganizationMemberRole } from '@-/organization-member';
import { ApiOrganizationMember } from '@-/organization-member/api';

export const OrganizationMember = <
	_$TestSlug extends string,
	$FixturesSpecInput,
>() => (defineFixture({
	async create(
		{
			user: userKey,
			organization: organizationKey,
			role,
		}: {
			user: FixtureKeyOfType<$FixturesSpecInput, 'User'>;
			organization: FixtureKeyOfType<$FixturesSpecInput, 'Organization'>;
			role: OrganizationMemberRole;
		},
	): Promise<DocBase<'OrganizationMember'>> {
		const user = await this.getFixture<'User'>(userKey);
		const organization = await this.getFixture<'Organization'>(organizationKey);
		const organizationMember = await ApiOrganizationMember.create({
			input: {
				data: {
					role,
					organization: organization._id,
					user: user._id,
				},
				include: {},
			},
		}).unwrapOrThrow();
		return organizationMember;
	},
	async destroy(organizationMember) {
		await ApiConvex.v.OrganizationMember.delete({
			input: { id: organizationMember._id },
		}).unwrapOrThrow();
	},
}));
