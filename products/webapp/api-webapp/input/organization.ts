import type { ActorMetaschema, Context } from '#types';
import { ApiConvex } from '@-/convex/api';
import { DocumentNotFoundError } from '@-/errors';
import type { OrganizationMemberRoleInputOptions } from '@-/organization-member';
import slugBlacklist from '@-/slug-blacklist';
import { z } from '@-/zod';
import { unreachableCase } from '@tunnel/ts';
import { $try, err, ok } from 'errok';
import { getActorRefDataFromActorMetaschema } from './internal/_.ts';

type OrganizationRefinerOptions = {
	actorOrganizationMemberRole: OrganizationMemberRoleInputOptions;
	actor: ActorMetaschema;
} & {
	plans: 'any' | 'teamOrHigher' | 'enterprise';
};

/**
	@example ```
		WebappApiInput.organization(options)(input, ctx)
	```
*/
export function WebappApiInput_organization(
	options: OrganizationRefinerOptions,
) {
	return function(_input: unknown, ctx: Context) {
		return z
			.object({ id: z.string() })
			.transform(async (
				{ id: organizationId },
			) => ($try(async function*() {
				const organization = yield* ApiConvex.v.Organization.get({
					from: { id: organizationId as any },
					include: {},
				}).safeUnwrap();

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
				if (organization === null) {
					return err(new DocumentNotFoundError('Organization'));
				}

				const actorRefData = yield* getActorRefDataFromActorMetaschema({
					actorMetaschema: options.actor,
					ctx,
				}).safeUnwrap();

				if (actorRefData === null) {
					return err(new Error('Must be authenticated'));
				}

				// We don't check permissions for demo organizations
				if (organization.isDemo) {
					return ok(organization._id);
				}

				const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
					from: {
						organization: organization._id,
						user: actorRefData.id,
					},
					include: {
						organization: true,
					},
				}).safeUnwrap();

				if (organizationMember === null) {
					return err(new Error('Must be a member of this organization'));
				}

				if (!options.actorOrganizationMemberRole[organizationMember.role]) {
					return err(
						new Error(
							'Insufficient permissions to access this organization.',
						),
					);
				}

				switch (options.plans) {
					case 'any': {
						break;
					}

					case 'teamOrHigher': {
						const plans = ['team', 'enterprise'];
						if (
							!plans.includes(organizationMember.organization.subscriptionPlan)
						) {
							return err(
								new Error(
									`Organization must be on one of the following plans: ${
										plans.join(
											', ',
										)
									}`,
								),
							);
						}

						break;
					}

					case 'enterprise': {
						const plans = ['enterprise'];
						if (
							!plans.includes(organizationMember.organization.subscriptionPlan)
						) {
							return err(
								new Error(
									`Organization must be on one of the following plans: ${
										plans.join(
											', ',
										)
									}`,
								),
							);
						}

						break;
					}

					default: {
						return unreachableCase(
							options.plans,
							`Unknown organization type: ${String(options.plans)}`,
						);
					}
				}

				return ok(organization._id);
			})));
	};
}

export function WebappApiInput_organizationSlug() {
	return z.string().transform((slug) => {
		if (slug.length === 0) {
			return err(new Error('Organization slug cannot be empty'));
		}

		if (slug.length > 64) {
			return err(
				new Error('Organization slug must not be more than 64 characters long'),
			);
		}

		if (slug in slugBlacklist) {
			return err(new Error('This organization slug cannot be used'));
		}

		return ok(slug);
	});
}

export function WebappApiInput_organizationName() {
	return z.string().transform((name) => {
		if (name.length === 0) {
			return err(new Error('Organization name cannot be empty'));
		}

		if (name.length > 64) {
			return err(
				new Error('Organization name must not be more than 64 characters long'),
			);
		}

		return ok(name);
	});
}
