/* eslint-disable no-await-in-loop -- Needed to process synchronously */

import { getWorkos } from '@-/auth/workos';
import { v } from '@-/convex/values';
import { type ServerDoc } from '@-/database';
import { defineAction } from '@-/database/function-utils';
import { getVapi } from '@-/database/vapi';

/**
	Ensures that a user in our database has a valid WorkOS user associated with them.
*/
export const User_ensureWorkosUser = defineAction({
	args: {
		user: v.id('User'),
	},
	async handler(ctx, { user: userId }) {
		const workos = getWorkos();
		const vapi: any = await getVapi();
		const user = await ctx.runQuery(
			vapi.v.User_get,
			{
				from: { id: userId },
				include: {},
			},
		) as ServerDoc<'User'> | null;

		if (user === null) {
			throw new Error('User not found');
		}

		if (user.workosUserId !== null) {
			try {
				return await workos.userManagement.getUser(user.workosUserId);
			} catch (error: any) {
				if (error.code !== 'entity_not_found') {
					throw error;
				}
			}
		}

		// The `workosUserId` is invalid, so we try to create a new WorkOS user with the given email
		try {
			const workosUser = await workos.userManagement.createUser({
				email: user.email,
				emailVerified: true,
				firstName: user.fullName.split(' ')[0],
				lastName: user.fullName.split(' ')[1],
			});

			return workosUser;
		} catch (error: any) {
			if (
				error.code === 'user_creation_error' &&
				error.errors.some((error: any) => error.code === 'email_not_available')
			) {
				const { data } = await workos.userManagement.listUsers({
					email: user.email,
				});

				const workosUser = data[0];
				if (workosUser === undefined) {
					throw new Error(
						'Unexpected issue while creating WorkOS user',
						{ cause: error },
					);
				}

				return workosUser;
			} else {
				throw error;
			}
		}
	},
});
