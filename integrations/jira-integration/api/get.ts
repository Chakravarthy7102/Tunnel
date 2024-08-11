import { ApiJira } from '#api';
import { ApiConvex } from '@-/convex/api';
import type { Id } from '@-/database';
import { DocumentNotFoundError } from '@-/errors';
import { $try, err, ok } from 'errok';
import { Version3Client } from 'jira';
import { Version3InternalClient } from './internal-jira-client.ts';

export const ApiJira_getClient = (
	{ organizationMemberId }: {
		organizationMemberId: Id<'OrganizationMember'>;
	},
) => ($try(async function*() {
	const organizationMember = yield* ApiConvex.v.OrganizationMember.get({
		from: { id: organizationMemberId },
		include: {
			linkedJiraAccount: true,
			organization: {
				include: {
					jiraOrganization: true,
				},
			},
		},
	}).safeUnwrap();

	if (organizationMember === null) {
		return err(new DocumentNotFoundError('OrganizationMember'));
	}

	if (organizationMember.linkedJiraAccount) {
		const data = yield* ApiJira.chooseTokenType({
			organizationMemberId,
		}).safeUnwrap();

		if (data === null || !data.accessToken || !data.refreshToken) {
			return err(new Error('Jira access token or refresh token is missing'));
		}

		const { accessToken } = yield* ApiJira.getAccessToken({
			organizationMemberId,
			accessToken: data.accessToken,
			refreshToken: data.refreshToken,
			expiresIn: data.expiresIn,
			createdAt: data.createdAt,
		}).safeUnwrap();

		return ok(
			new Version3Client({
				host:
					`https://api.atlassian.com/ex/jira/${organizationMember.linkedJiraAccount.jiraCloudId}`,
				authentication: {
					oauth2: {
						accessToken,
					},
				},
			}),
		);
	} else {
		return ok(Version3InternalClient({
			webTriggerUrl: organizationMember.organization.jiraOrganization
				?.webTriggerUrl as string,
		}));
	}
}));
