import type { FixtureKeyOfType } from '#types';
import { defineFixture } from '#utils/define.ts';
import { deleteIgnoringNonexistentError } from '#utils/delete.ts';
import { ApiConvex } from '@-/convex/api';
import type { DocBase } from '@-/database';
import { createId } from '@paralleldrive/cuid2';

export const Project = <
	$TestSlug extends string,
	$FixturesSpecInput,
>(
	_testSlug: $TestSlug,
) => (defineFixture({
	async create({ ownerOrganization, name }: {
		ownerOrganization: FixtureKeyOfType<$FixturesSpecInput, 'Organization'>;
		name?: string;
	}): Promise<DocBase<'Project'>> {
		const organization = await this.getFixture<'Organization'>(
			ownerOrganization,
		);

		return ApiConvex.v.Project.create({
			input: {
				data: {
					slug: createId(),
					githubRepository: null,
					isUnnamed: name === undefined,
					organization: organization._id,
					name: name ?? 'Unnamed Project',
				},
				include: {},
			},
		}).unwrapOrThrow();
	},
	async destroy(project) {
		await deleteIgnoringNonexistentError(
			ApiConvex.v.Project.delete({ input: { id: project._id } }),
		);
	},
}));
