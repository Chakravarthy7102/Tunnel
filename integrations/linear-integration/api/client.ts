import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import { LinearClient } from '@linear/sdk';
import { $try, err, ok } from 'errok';

export const ApiLinear_getClient = ({
	organizationMemberId,
}: {
	organizationMemberId: Id<'OrganizationMember'>;
}) => ($try(async function*() {
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: { id: organizationMemberId },
		include: {
			linkedLinearAccount: true,
			organization: {
				include: {
					linearOrganization: true,
				},
			},
		},
	}).safeUnwrap();

	if (organizationMember === null) {
		return err(new DocumentNotFoundError('OrganizationMember'));
	}

	const orgAccessToken = organizationMember.organization.linearOrganization
		?.access_token;

	const personalAccessToken = organizationMember.linkedLinearAccount
		?.accessToken;

	return ok(
		new LinearClient({
			apiKey: personalAccessToken ?? orgAccessToken as string,
		}),
	);
}));
