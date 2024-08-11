import { getWorkos } from '@-/auth/workos';
import { ApiConvex } from '@-/convex/api';
import { type Doc, type Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import { logger } from '@-/logger';
import { $try, err, ok } from 'errok';

export const ApiUser_update = ({ input: { id, updates } }: {
	input: {
		id: Id<'User'>;
		updates: Partial<{
			email: string;
			workosUserId: string;
			fullName: string;
			timezone: string;
			username: string;
			profileImageUrl: string | null;
			callSettings: Partial<Doc<'User'>['callSettings']>;
			githubAccount: {
				accessToken: string;
				username: string;
				userId: number;
			};
		}>;
	};
}) => ($try(async function*() {
	yield* ApiConvex.v.User._update({
		input: {
			id,
			updates,
		},
	}).safeUnwrap();

	if (updates.fullName !== undefined) {
		const user = yield* ApiConvex.v.User.get({
			from: { id },
			include: {},
		}).safeUnwrap();

		if (user === null) {
			return err(new DocumentNotFoundError('User'));
		}

		const { workosUserId } = user;
		const nameParts = updates.fullName.split(' ');

		let firstName: string;
		let lastName: string;
		if (nameParts.length === 1) {
			firstName = nameParts[0] ?? '';
			lastName = '';
		} else {
			firstName = nameParts[0] ?? '';
			lastName = nameParts.at(-1) ?? '';
		}

		const workos = getWorkos();
		try {
			if (workosUserId !== null) {
				await workos.userManagement.updateUser({
					userId: workosUserId,
					firstName,
					lastName,
				});
			}
		} catch (error) {
			logger.error('Failed to update WorkOS user:', error);
		}
	}

	return ok();
}));
