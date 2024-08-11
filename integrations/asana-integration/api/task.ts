import { ApiAsana } from '#api';
import type { Id } from '@-/database';
import { $try, ok } from 'errok';

export const ApiAsana_resolveTask = ({
	organizationMemberId,
	taskId,
}: {
	organizationMemberId: Id<'OrganizationMember'>;
	taskId: string;
}) => ($try(async function*() {
	const asanaClient = yield* ApiAsana.getClient({
		organizationMemberId,
	}).safeUnwrap();

	await asanaClient.tasks.update(taskId, {
		completed: true,
	});

	return ok();
}));
