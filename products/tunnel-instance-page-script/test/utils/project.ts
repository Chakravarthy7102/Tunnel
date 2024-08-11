import { getTestProject } from '@-/database-test-fixtures';

export async function createTunnelProject() {
	const { projectId } = await getTestProject().unwrapOrThrow();
	return projectId;
}
