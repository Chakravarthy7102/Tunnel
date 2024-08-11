import { getWebappTrpc } from '#utils/trpc.ts';
import type { Actor } from '@-/actor';
import type { Id } from '@-/database';

export async function createNewTunnelInstanceProxyPreview({
	actor,
	projectId,
	userLocalWorkspaceId,
	gitUrl,
	localServicePortNumber,
	localServiceOriginalPortNumber,
	localTunnelProxyServerPortNumber,
}: {
	actor: Actor<'User'>;
	projectId: string;
	userLocalWorkspaceId: Id<'UserLocalWorkspace'>;
	gitUrl: string | null;
	localServicePortNumber: number;
	localServiceOriginalPortNumber: number;
	localTunnelProxyServerPortNumber: number;
}) {
	const { webappTrpc } = await getWebappTrpc();
	const result = await webappTrpc.tunnelInstanceProxyPreview.create.mutate({
		actor,
		project: {
			id: projectId,
		},
		createdByUser: {
			id: actor.data.id,
		},
		userLocalWorkspace: {
			id: userLocalWorkspaceId,
		},
		gitUrl,
		localServicePortNumber,
		localServiceOriginalPortNumber,
		localTunnelProxyServerPortNumber,
	});

	if (result.isErr()) {
		process.stderr.write(
			`Couldn't create a tunnel instance proxy preview: ${
				String(result.error)
			}`,
		);
		process.exit(1);
	}

	return { tunnelInstanceProxyPreviewId: result.value._id };
}
