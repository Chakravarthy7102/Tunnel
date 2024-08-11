import type { ActorMetaschema, Context } from '#types';
import { ApiConvex } from '@-/convex/api';
import { idSchema } from '@-/database/schemas';
import { DocumentNotFoundError } from '@-/errors';
import type { OrganizationMemberRoleInputOptions } from '@-/organization-member';
import { z } from '@-/zod';
import { unreachableCase } from '@tunnel/ts';
import { $try, err, ok } from 'errok';
import { getActorRefDataFromActorMetaschema } from './internal/actor.ts';

type OrganizationMemberRefinerOptions =
	& {
		actor: ActorMetaschema;
	}
	& ({
		actorRelation: 'anyone' | 'notActor';
		actorOrganizationMemberRole: OrganizationMemberRoleInputOptions;
		targetOrganizationMemberRole: OrganizationMemberRoleInputOptions;
	} | {
		actorRelation: 'actor';
		actorOrganizationMemberRole: OrganizationMemberRoleInputOptions;
	});

/**
	@example ```
		WebappApiInput.organizationMember(options)(input, ctx)
	```
*/
export function WebappApiInput_organizationMember(
	options: OrganizationMemberRefinerOptions,
) {
	return function(_input: unknown, ctx: Context) {
		return z
			.object({ id: idSchema('OrganizationMember') })
			.transform(async ({ id }) => ($try(async function*() {
				const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
					from: { id },
					include: {
						organization: true,
						user: true,
					},
				}).safeUnwrap();

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
				if (organizationMember === null) {
					return err(new DocumentNotFoundError('OrganizationMember'));
				}

				const actorRefData = yield* getActorRefDataFromActorMetaschema({
					actorMetaschema: options.actor,
					ctx,
				}).safeUnwrap();

				if (actorRefData === null || actorRefData.type !== 'User') {
					return err(new Error('Not authorized as a user'));
				}

				const actorOrganizationMember = yield* ApiConvex.v.OrganizationMember
					.get({
						from: {
							organization: organizationMember.organization._id,
							user: actorRefData.id,
						},
						include: {},
					}).safeUnwrap();

				if (actorOrganizationMember === null) {
					return err(new Error('Not a member of this organization'));
				}

				if (
					!options.actorOrganizationMemberRole[actorOrganizationMember.role]
				) {
					return err(new Error('Insufficient permissions'));
				}

				if (
					options.actorRelation === 'actor' &&
					actorRefData.id !== organizationMember.user._id
				) {
					return err(
						new Error('Not permitted to perform action on user'),
					);
				}

				switch (options.actorRelation) {
					case 'anyone': {
						break;
					}

					case 'actor': {
						if (organizationMember.user._id !== actorRefData.id) {
							return err(
								new Error(
									'Actor must be the same user as the organization member.',
								),
							);
						}

						break;
					}

					case 'notActor': {
						if (organizationMember.user._id === actorRefData.id) {
							return err(
								new Error(
									'Actor cannot be the same user as the organization member.',
								),
							);
						}

						break;
					}

					default: {
						return unreachableCase(
							options,
							`Invalid actor relation: ${JSON.stringify(options)}`,
						);
					}
				}

				return ok(organizationMember._id);
			})));
	};
}
