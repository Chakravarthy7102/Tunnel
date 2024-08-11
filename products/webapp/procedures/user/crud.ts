import { WebappApiInput } from '#api-input';
import { defineProcedure } from '#utils/procedure.ts';
import { ApiConvex } from '@-/convex/api';
import { type Selection } from '@-/database';
import { idSchema } from '@-/database/schemas';
import { getInclude } from '@-/database/selection-utils';
import {
	User_$organizationMembersData,
	User_$profileData,
} from '@-/database/selections';
import { ProcedureError } from '@-/errors';
import { ApiUser } from '@-/user/api';
import { z } from '@-/zod';
import { $try, ok } from 'errok';
import type { EmptyObject } from 'type-fest';

const buildGetProcedure = <$Selection extends Selection | EmptyObject>(
	selection: $Selection,
) => (defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			user: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
		})),
	query: async ({ input: { user } }) => ($try(async function*() {
		const userId = yield* user.safeUnwrap();
		return ApiConvex.v.User.get({
			from: { id: userId },
			include: getInclude(selection),
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't get user", error),
}));

export const user_get = buildGetProcedure({});
export const user_get$profileData = buildGetProcedure(User_$profileData);
export const user_get$organizationMembersData = buildGetProcedure(
	User_$organizationMembersData,
);

export const user_hasCreatedProject = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			user: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
		})),
	query: async ({
		input: { user },
	}) => ($try(async function*() {
		const userId = yield* user.safeUnwrap();
		return ApiConvex.v.User.hasCreatedProject({
			id: userId,
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't get user", error),
});

export const user_getPublicData = defineProcedure({
	input: z.object({
		user: z.object({ id: idSchema('User') }),
	}),
	query: async ({ input }) => ($try(async function*() {
		const user = yield* ApiConvex.v.User.get({
			from: { id: input.user.id },
			include: {},
		}).safeUnwrap();
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
		if (user === null) return ok(null);

		return ok({ _id: user._id });
	})),
	error: ({ error }) => new ProcedureError("Couldn't get user", error),
});

export const user_getBotUser = defineProcedure({
	input: z.object({}),
	query: async () => ($try(async function*() {
		let botUser = yield* ApiConvex.v.User.get({
			from: { username: 'tunnel-bot' },
			include: {},
		}).safeUnwrap();

		if (botUser === null) {
			botUser = yield* ApiUser.create({
				input: {
					isBotUser: true,
					data: {
						email: 'bot@tunnel.dev',
						fullName: 'Tunnel Bot',
						profileImageUrl: 'https://tunnel.dev/assets/images/logo.png',
						username: 'tunnel-bot',
					},
					include: {},
				},
			}).safeUnwrap();
		}

		return ok({ user: botUser });
	})),
	error: ({ error }) => new ProcedureError("Couldn't get bot user", error),
});

export const user_update = defineProcedure({
	input: WebappApiInput.withActor('User', (actor, { input, ctx }) =>
		z.object({
			user: WebappApiInput.user({
				actor,
				actorRelation: 'actor',
			})(input, ctx),
			updates: z.object({
				fullName: z.string().optional(),
				timezone: z.string().optional(),
				username: WebappApiInput.username().optional(),
				profileImageUrl: z.string().optional(),
				callSettings: z
					.object({
						microphoneDeviceId: z.string().optional(),
						microphoneDeviceName: z.string().optional(),
						videoDeviceId: z.string().optional(),
						videoDeviceName: z.string().optional(),
						speakerDeviceId: z.string().optional(),
						speakerDeviceName: z.string().optional(),
					})
					.optional(),
			}),
		})),
	mutation: async ({ input }) => ($try(async function*() {
		const userId = yield* input.user.safeUnwrap();
		const username = input.updates.username === undefined ?
			undefined :
			yield* input.updates.username.safeUnwrap();
		return ApiUser.update({
			input: {
				id: userId,
				updates: {
					...input.updates,
					username,
				},
			},
		});
	})),
	error: ({ error }) => new ProcedureError("Couldn't update user", error),
});
