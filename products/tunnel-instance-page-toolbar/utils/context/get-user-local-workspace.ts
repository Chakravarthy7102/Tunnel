import type { PageToolbarContext } from '#types';
import { getWebappTrpc } from '#utils/trpc.ts';
import { getLocalProxyTrpc } from '#utils/trpc/local-proxy.ts';
import { useConvex } from '@-/convex/react';
import type { Id } from '@-/database';
import { getVapi } from '@-/database/vapi';
import type { HostEnvironmentType } from '@-/host-environment';

export function useGetUserLocalWorkspace() {
	const convex = useConvex();
	return async function getUserLocalWorkspace(
		{ context, providedProjectId, relativeDirpath, actorUserId }: {
			context: PageToolbarContext<{
				hostEnvironmentType: HostEnvironmentType.wrapperCommand;
				hostnameType: 'local';
			}>;
			actorUserId: Id<'User'>;
			providedProjectId: Id<'Project'> | null;
			relativeDirpath: string;
		},
	) {
		const vapi = await getVapi();
		const { localProxyTrpc } = getLocalProxyTrpc({ context });
		if (providedProjectId === null) {
			const userLocalWorkspaceId =
				(await localProxyTrpc.userLocalWorkspace.getActive.query({
					actorUserId,
					relativeDirpath,
				})).unwrapOrThrow();

			if (userLocalWorkspaceId === null) {
				return null;
			}

			try {
				return await convex.query(
					vapi.v
						.UserLocalWorkspace_get_recursiveTunneledServiceEnvironmentData,
					{
						input: {
							from: userLocalWorkspaceId,
						},
					},
				);
			} catch {
				return null;
			}
		}

		// @ts-expect-error: todo
		const { webappTrpc } = getWebappTrpc({ context });

		// The project ID was provided
		const projectResult = await webappTrpc.project.get$organizationData
			.query({
				actor: {
					type: 'User',
					data: {
						id: actorUserId,
					},
				},
				project: {
					id: providedProjectId,
				},
			});

		if (projectResult.isErr()) {
			return null;
		}

		let userLocalWorkspace = await (async () => {
			try {
				return await convex.query(
					vapi.v
						.UserLocalWorkspace_get_recursiveTunneledServiceEnvironmentData,
					{
						input: {
							from: {
								project: providedProjectId,
								relativeDirpath,
								user: actorUserId,
							},
						},
					},
				);
			} catch {
				return null;
			}
		})();

		// eslint-disable-next-line max-depth -- todo
		if (userLocalWorkspace === null) {
			userLocalWorkspace = await convex.mutation(
				vapi.v
					.UserLocalWorkspace_insert_recurTunneledServiceEnvironmentData,
				{
					input: {
						linkedTunnelInstanceProxyPreview: null,
						project: providedProjectId,
						relativeDirpath,
						user: actorUserId,
					},
				},
			);
		}

		(await localProxyTrpc.userLocalWorkspace.save.mutate({
			userLocalWorkspaceId: userLocalWorkspace._id,
			relativeDirpath: userLocalWorkspace.relativeDirpath,
			userId: actorUserId,
			projectId: userLocalWorkspace.project._id,
			linkedTunnelInstanceProxyPreviewId:
				userLocalWorkspace.linkedTunnelInstanceProxyPreview?._id ?? null,
		})).unwrapOrThrow();

		return userLocalWorkspace;
	};
}
