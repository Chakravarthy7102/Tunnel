import { getConvex } from '@-/convex/cli';
import type { Id } from '@-/database';
import { getVapi } from '@-/database/vapi';
import { $try, type TryOk } from 'errok';
import path from 'pathe';

export const getOrCreateUserLocalWorkspace = ({
	projectId,
	actorUserId,
	localProjectRootDirpath,
	localProjectWorkingDirpath,
}: {
	projectId: Id<'Project'>;
	actorUserId: Id<'User'>;
	localProjectRootDirpath: string;
	localProjectWorkingDirpath: string;
}) => ($try(async function*(
	$ok: TryOk<{
		userLocalWorkspaceId: Id<'UserLocalWorkspace'>;
		linkedTunnelInstanceProxyPreview: {
			_id: Id<'TunnelInstanceProxyPreview'>;
			localServicePortNumber: number;
		} | null;
	}>,
) {
	const convex = await getConvex({ actorUserId });
	const vapi = await getVapi();

	let userLocalWorkspace = await (async () => {
		try {
			return await convex.query(
				vapi.v.UserLocalWorkspace_get_linkedProxyPreviewData,
				{
					input: {
						from: {
							user: actorUserId,
							project: projectId,
							relativeDirpath: path.relative(
								localProjectRootDirpath,
								localProjectWorkingDirpath,
							),
						},
					},
				},
			);
		} catch {
			return null;
		}
	})();

	if (userLocalWorkspace === null) {
		userLocalWorkspace = await convex.mutation(
			vapi.v.UserLocalWorkspace_insert_linkedProxyPreviewData,
			{
				input: {
					user: actorUserId,
					project: projectId,
					relativeDirpath: path.relative(
						localProjectRootDirpath,
						localProjectWorkingDirpath,
					),
					linkedTunnelInstanceProxyPreview: null,
				},
			},
		);
	}

	return $ok({
		userLocalWorkspaceId: userLocalWorkspace._id,
		linkedTunnelInstanceProxyPreview:
			userLocalWorkspace.linkedTunnelInstanceProxyPreview ?? null,
	});
}));
