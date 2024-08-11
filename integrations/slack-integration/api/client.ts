import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import { WebClient } from '@slack/web-api';
import { $try, err, ok } from 'errok';

export const ApiSlack_getClient = (
	args: {
		organizationMemberId: Id<'OrganizationMember'>;
		asBot?: boolean;
	} | { accessToken: string },
) => ($try(async function*() {
	if ('organizationMemberId' in args) {
		const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
			from: { id: args.organizationMemberId },
			include: {
				organization: {
					include: {
						slackOrganization: true,
					},
				},
				linkedSlackAccount: true,
			},
		}).safeUnwrap();

		if (organizationMember === null) {
			return err(new DocumentNotFoundError('OrganizationMember'));
		}

		const orgAccessToken = organizationMember.organization.slackOrganization
			?.accessToken;

		const personalAccessToken = organizationMember.linkedSlackAccount
			?.accessToken;

		let accessToken = orgAccessToken;

		if (args.asBot) {
			accessToken = orgAccessToken;
		} else if (personalAccessToken) {
			accessToken = personalAccessToken;
		}

		return ok(
			new WebClient(accessToken as string),
		);
	} else {
		return ok(
			new WebClient(args.accessToken),
		);
	}
}));
