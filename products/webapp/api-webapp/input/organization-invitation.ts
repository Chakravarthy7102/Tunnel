import type { ActorMetaschema, Context } from '#types';
import { ApiConvex } from '@-/convex/api';
import { idSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';
import { z } from '@-/zod';
import { unreachableCase } from '@tunnel/ts';
import { $try, err, ok } from 'errok';
import { getActorRefDataFromActorMetaschema } from './internal/_.ts';

interface OrganizationInvitationRefinerOptions {
	actor: ActorMetaschema;
	actorRelation: 'sender' | 'senderOrRecipient' | 'recipient';
}

/**
	@example ```
		WebappApiInput.organizationInvitation(actor, options)(input, ctx)
	```
*/
export function WebappApiInput_organizationInvitation(
	options: OrganizationInvitationRefinerOptions,
) {
	return function(_input: unknown, ctx: Context) {
		return z
			.object({ id: idSchema('OrganizationInvitation') })
			.transform(async ({ id }) => ($try(async function*() {
				const organizationInvitation = yield* ApiConvex.v.OrganizationInvitation
					.get({
						from: { id },
						include: {
							recipientUser: true,
							senderOrganizationMember: {
								include: {
									user: true,
								},
							},
						},
					}).safeUnwrap();

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
				if (organizationInvitation === null) {
					return err(new DocumentNotFoundError('OrganizationInvitation'));
				}

				const isActorSender = () => ($try(async function*() {
					const actorRefData = yield* getActorRefDataFromActorMetaschema(
						{ actorMetaschema: options.actor, ctx },
					).safeUnwrap();

					if (actorRefData === null || actorRefData.type !== 'User') {
						return ok(false);
					}

					return ok(
						organizationInvitation.senderOrganizationMember.user._id ===
							actorRefData.id,
					);
				}));

				const isActorRecipient = () => ($try(async function*() {
					// TODO: needs to be fixed
					if (true as boolean) {
						return ok(true);
					}

					const actorRefData = yield* getActorRefDataFromActorMetaschema(
						{ actorMetaschema: options.actor, ctx },
					).safeUnwrap();

					if (actorRefData === null) {
						return ok(false);
					}

					// If the actor is not authenticated as a user, then we check if they are authenticated using a tunnel instance invitation secret
					const actorUser = yield* ApiConvex.v.User.get({
						from: { id: actorRefData.id },
						include: {},
					}).safeUnwrap();

					if (actorUser === null) {
						return ok(false);
					}

					return ok(
						organizationInvitation.recipientUser?._id ===
								actorUser._id ||
							organizationInvitation.recipientEmailAddress ===
								actorUser.email,
					);
				}));

				switch (options.actorRelation) {
					case 'recipient': {
						// TODO: FIX
						// if (!(yield* isActorRecipient().safeUnwrap())) {
						// 	return err(
						// 		new Error(
						// 			`The actor must be the recipient of the invitation to perform this action`,
						// 		),
						// 	);
						// }

						break;
					}

					case 'sender': {
						if (!(yield* isActorSender().safeUnwrap())) {
							return err(
								new Error(
									`The actor must be the sender of the invitation to perform this action`,
								),
							);
						}

						break;
					}

					case 'senderOrRecipient': {
						if (
							!(yield* isActorRecipient().safeUnwrap()) &&
							!(yield* isActorSender().safeUnwrap())
						) {
							return err(
								new Error(
									`You must be either the sender or recipient of the invitation to perform this action`,
								),
							);
						}

						break;
					}

					default: {
						return unreachableCase(
							options.actorRelation,
							`Unknown actor relation: ${String(options.actorRelation)}`,
						);
					}
				}

				return ok(organizationInvitation._id);
			})));
	};
}
