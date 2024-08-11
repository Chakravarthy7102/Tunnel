import type { ActorMetaschema, Context } from '#types';
import type { Actor } from '@-/actor';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import slugBlacklist from '@-/slug-blacklist';
import {
	z,
	type ZodEffects,
	type ZodIntersection,
	type ZodSchema,
} from '@-/zod';
import { $try, err, ok, type TryOk } from 'errok';
import invariant from 'tiny-invariant';
import {
	actorInputSchemas,
	getActorRefDataFromActorMetaschema,
} from './internal/_.ts';

type UserIdRefinerOptions =
	| {
		actor: ActorMetaschema;
		actorRelation: 'actor' | 'notActor';
	}
	| {
		actor: null;
		actorRelation: 'anyone';
	};

/**
	@example ```
		WebappApiInput.user({ actorRelation: 'notActor' })(input, ctx)
	```
*/
export function WebappApiInput_user(options: UserIdRefinerOptions) {
	return function(_input: unknown, ctx: Context) {
		return z.object({ id: z.string() })
			.transform(async (input) => ($try(async function*(
				$ok: TryOk<Id<'User'>>,
			) {
				const user = yield* ApiConvex.v.User.get({
					from: { id: input.id },
					include: {},
				}).safeUnwrap();

				if (user === null) {
					return err(new DocumentNotFoundError('User'));
				}

				const userId = user._id;

				if (options.actorRelation === 'anyone') {
					return $ok(userId);
				}

				const actorRefData = yield* getActorRefDataFromActorMetaschema({
					actorMetaschema: options.actor,
					ctx,
				}).safeUnwrap();

				if (actorRefData === null || actorRefData.type !== 'User') {
					return err(
						new Error(
							`Expected a user to be authenticated, received "${
								actorRefData?.type ?? null
							}" instead`,
						),
					);
				}

				if (
					options.actorRelation === 'notActor' &&
					actorRefData.id === userId
				) {
					return err(new Error('The actor cannot be the user'));
				} else if (
					options.actorRelation === 'actor' &&
					actorRefData.id !== userId
				) {
					return err(new Error('The actor must be the user'));
				}

				return $ok(userId);
			})));
	};
}

type ZodActor<$ActorTypes extends 'User'> = ReturnType<
	(typeof actorInputSchemas)[$ActorTypes]
>;

/**
	Note that we intentionally omit `actorRefData` in the "output" type because actors should only be used for authorization and not data access (the procedure should force the client to pass in all necessary input explicitly, i.e. outside the `actor` property as well).

	@example ```
		WebappApiInput.withActor(['User'], (actor, { input, ctx }) => ({ ... }))(input, ctx)
	```

*/
export function WebappApiInput_withActor<
	const $ActorTypes extends 'User',
>(
	allowedActorTypes: $ActorTypes,
): ZodEffects<
	ZodActor<$ActorTypes>,
	{ accessToken: string },
	{ actor: Actor<'User'> }
>;
export function WebappApiInput_withActor<
	const $ActorTypes extends 'User',
	$SchemaGetter extends (
		actor: ActorMetaschema,
		args: { input: unknown; ctx: Context },
	) => ZodSchema,
>(
	allowedActorTypes: $ActorTypes,
	schemaGetter: $SchemaGetter,
): ZodIntersection<
	ReturnType<$SchemaGetter>,
	ZodEffects<
		ZodActor<$ActorTypes>,
		{ accessToken: string },
		{ actor: Actor<'User'> }
	>
>;
export function WebappApiInput_withActor(
	allowedActorTypesStringOrArray: string | string[],
	schemaGetter?: (
		actor: ActorMetaschema,
		args: { input: unknown; ctx: Context },
	) => ZodSchema,
): ZodSchema {
	// @ts-expect-error: We lie about the type
	return function(input: unknown, ctx: Context) {
		const possibleSchemas: ZodSchema[] = [];

		const allowedActorTypes = Array.isArray(allowedActorTypesStringOrArray) ?
			allowedActorTypesStringOrArray :
			[allowedActorTypesStringOrArray];

		for (const allowedActorType of allowedActorTypes) {
			possibleSchemas.push(
				actorInputSchemas[allowedActorType as keyof typeof actorInputSchemas](
					input,
					ctx,
				),
			);
		}

		let actorSchema: ZodSchema;
		if (possibleSchemas.length === 1) {
			invariant(possibleSchemas[0] !== undefined, 'Guaranteed to be defined');
			actorSchema = possibleSchemas[0];
		} else {
			// @ts-expect-error: Guaranteed to contain at least two schemas
			actorSchema = z.union(possibleSchemas);
		}

		if (schemaGetter !== undefined) {
			const augmentedSchema = schemaGetter(
				{ actorProperty: 'actor', input },
				{ input, ctx },
			);
			return z.intersection(
				z
					.object({ actor: actorSchema })
					.transform(({ actor: actorRefData }) => ({
						actorRefData,
						// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist if the actorSchema successfully parses (since all actors need an `accessToken`)
						accessToken: ctx.accessToken!,
					})),
				augmentedSchema,
			);
		} else {
			return z
				.object({ actor: actorSchema })
				.transform(({ actor: actorRefData }) => ({
					actorRefData,
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist if the actorSchema successfully parses (since all actors need an `accessToken`)
					accessToken: ctx.accessToken!,
				}));
		}
	};
}

export function WebappApiInput_username() {
	return z
		.string().transform((username) => {
			if (username.length === 0) {
				return err(new Error('A username must be at least one letter long'));
			}

			if (username.length > 64) {
				return err(
					new Error('A username must not be more than 64 characters long.'),
				);
			}

			if (username in slugBlacklist) {
				return err(new Error('This username cannot be used.'));
			}

			if (!/^[\dA-Za-z-]+$/.test(username)) {
				return err(
					new Error('Username must only contain alphanumeric characters.'),
				);
			}

			return ok(username);
		});
}
