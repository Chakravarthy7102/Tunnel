import type { AuthSession } from '#types';
import { defineFixture } from '#utils/define.ts';
import { deleteIgnoringNonexistentError } from '#utils/delete.ts';
import type { DocBase } from '@-/database';
import { ApiUser } from '@-/user/api';
import { createId } from '@paralleldrive/cuid2';

export const User = <
	$TestSlug extends string,
	_$FixturesSpecInput,
>(_testSlug: $TestSlug) => (defineFixture({
	async create(
		{ authSession }: { authSession: AuthSession },
		{ id },
	): Promise<DocBase<'User'>> {
		return ApiUser.create({
			input: {
				data: {
					email: `${id}-${authSession.index}+tunnel_test@tunnel.dev`,
					fullName: 'Test User',
					username: createId(),
					profileImageUrl:
						'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg',
				},
				include: {},
			},
		}).unwrapOrThrow();
	},
	async destroy(user) {
		await deleteIgnoringNonexistentError(
			ApiUser.delete({ input: { id: user._id } }),
		);
	},
}));
