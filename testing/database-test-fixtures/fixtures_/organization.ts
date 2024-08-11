import type { FixtureKeyOfType } from '#types';
import { defineFixture } from '#utils/define.ts';
import { deleteIgnoringNonexistentError } from '#utils/delete.ts';
import type { DocBase } from '@-/database';
import { ApiOrganization } from '@-/organization/api';
import { createId } from '@paralleldrive/cuid2';

export const Organization = <
	$TestSlug extends string,
	$FixturesSpecInput,
>(_testSlug: $TestSlug) => (defineFixture({
	async create({
		ownerUser,
		name,
		createOwnerOrganizationMember,
		subscriptionPlan,
	}: {
		ownerUser: FixtureKeyOfType<$FixturesSpecInput, 'User'>;
		createOwnerOrganizationMember?: boolean;
		name?: string;
		subscriptionPlan?: 'free' | 'team';
	}): Promise<DocBase<'Organization'>> {
		const user = await this.getFixture<'User'>(ownerUser);
		const { doc: organization } = await ApiOrganization.create({
			input: {
				organization: {
					name: name ?? 'Test Organization',
					slug: createId(),
					isOnboarded: true,
					metadata: { ownerRole: null, size: null },
					subscriptionPlan: subscriptionPlan ?? 'free',
					profileImageUrl: null,
					githubOrganization: null,
					invite: null,
				},
				ownerUser: user._id,
				createOwnerOrganizationMember,
				include: {},
			},
		}).unwrapOrThrow();

		return organization;
	},
	async destroy(organization) {
		await deleteIgnoringNonexistentError(
			ApiOrganization.delete({ input: { id: organization._id } }),
		);
	},
}));
