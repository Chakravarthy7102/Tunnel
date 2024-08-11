import { defineProcedure } from '#utils/procedure.ts';
import { getActorString } from '@-/actor';
import { getCliStorage } from '@-/cli-storage';
import { idSchema } from '@-/database/schemas';
import { ProcedureError } from '@-/errors';
import { z } from '@-/zod';
import { ok } from 'errok';
import { excludeKeys } from 'filter-obj';

export const auth_get = defineProcedure({
	input: z.object({
		actor: z.object({
			type: z.literal('User'),
			data: z.object({
				id: idSchema('User'),
			}),
		}),
	}),
	async query({ input: { actor } }) {
		const cliStorage = getCliStorage();
		const { savedActorsData } = await cliStorage.get();
		const actorData = savedActorsData[getActorString(actor)];
		return ok(
			actorData === undefined ? null : {
				accessToken: actorData.accessToken,
			},
		);
	},
	error: ({ error }) =>
		new ProcedureError(
			'There was an error retrieving account login information',
			error,
		),
});

/**
	When the user signs in from the browser, we want to sign in on the CLI
*/
export const auth_set = defineProcedure({
	input: z.object({
		actor: z.object({
			type: z.literal('User'),
			data: z.object({
				id: idSchema('User'),
			}),
		}),
		tokens: z.object({
			accessToken: z.string(),
			refreshToken: z.string(),
		}).nullable(),
	}),
	async mutation({
		input: { actor, tokens },
		ctx: { context },
	}) {
		const cliStorage = getCliStorage();
		if (tokens === null) {
			await cliStorage.set((oldData) => ({
				...oldData,
				savedActorsData: excludeKeys(
					oldData.savedActorsData,
					[getActorString(actor)],
				),
			}));
		} else {
			await cliStorage.set((oldData) => ({
				...oldData,
				savedActorsData: {
					...oldData.savedActorsData,
					[getActorString(actor)]: {
						accessToken: tokens.accessToken,
						refreshToken: tokens.refreshToken,
						actor,
					},
				},
			}));
		}

		context.state.actor = actor;

		return ok();
	},
	error: ({ error }) =>
		new ProcedureError(
			'There was an error saving account login information',
			error,
		),
});

export const auth_signOut = defineProcedure({
	input: z.object({}),
	async mutation({ ctx: { context } }) {
		context.state.actor = null;
		return ok();
	},
	error: ({ error }) =>
		new ProcedureError(
			'There was an error signing out',
			error,
		),
});
