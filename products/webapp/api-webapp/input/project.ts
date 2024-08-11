import type { ActorMetaschema, Context } from '#types';
import { ApiConvex } from '@-/convex/api';
import { DocumentNotFoundError, InsufficientPermissionsError } from '@-/errors';
import { z } from '@-/zod';
import { $try, err, ok } from 'errok';
import { getActorRefDataFromActorMetaschema } from './internal/_.ts';

interface ProjectRefinerOptions {
	actorOrganizationMemberRole: {
		guest: boolean;
		member: boolean;
		admin: boolean;
		owner: boolean;
	};
	actor: ActorMetaschema;
}

/**
	@example ```
		WebappApiInput.project(options)(input, ctx)
	```
*/
export function WebappApiInput_project(
	options: ProjectRefinerOptions,
) {
	return function(_input: unknown, ctx: Context) {
		return z
			.object({ id: z.string() })
			.transform(async ({ id: projectId }) => ($try(async function*() {
				const project = yield* ApiConvex.v.Project.get({
					from: { id: projectId as any },
					include: {
						organization: true,
					},
				}).safeUnwrap();

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- todo
				if (project === null) {
					return err(new DocumentNotFoundError('Project'));
				}

				const actorRefData = yield* getActorRefDataFromActorMetaschema({
					actorMetaschema: options.actor,
					ctx,
				}).safeUnwrap();

				if (actorRefData === null || actorRefData.type !== 'User') {
					return err(new Error('Actor must be authenticated as a user.'));
				}

				const organization = yield* ApiConvex.v.Organization.get({
					from: { id: project.organization._id },
					include: {},
				}).safeUnwrap();

				if (organization === null) {
					return err(new DocumentNotFoundError('Organization'));
				}

				const actorOrganizationMember = yield* ApiConvex.v.OrganizationMember
					.get({
						from: {
							organization: organization._id,
							user: actorRefData.id,
						},
						include: {},
					}).safeUnwrap();

				if (actorOrganizationMember === null) {
					const actorUser = yield* ApiConvex.v.User.get({
						from: { id: actorRefData.id },
						include: {},
					}).safeUnwrap();

					return err(new InsufficientPermissionsError({ actorUser }));
				}

				if (
					!options.actorOrganizationMemberRole[actorOrganizationMember.role]
				) {
					return err(new Error('Insufficient permissions'));
				}

				return ok(project._id);
			})));
	};
}
