import { ApiSlack } from '#api';
import type { Id } from '@-/database';
import { $try, err, ok, ResultAsync } from 'errok';

export const ApiSlack_getChannels = ({
	organizationMemberId,
}: {
	organizationMemberId: Id<'OrganizationMember'>;
}) => ($try(async function*() {
	const slackClient = yield* ApiSlack.getClient({
		organizationMemberId,
	}).safeUnwrap();

	const response = yield* ResultAsync.fromPromise(
		slackClient.conversations.list({
			limit: 100,
		}),
		(error) =>
			new Error(`Failed to get channels: Error: ${JSON.stringify(error)}`),
	).safeUnwrap();

	if ('channels' in response) {
		return ok(response.channels);
	} else {
		return err(
			new Error(`Failed to get channels: ${JSON.stringify(response)}`),
		);
	}
}));
