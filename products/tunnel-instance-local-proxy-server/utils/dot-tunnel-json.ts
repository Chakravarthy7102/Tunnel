import type { LocalProxyContext } from '#types';
import { getWebappTrpc } from '#utils/trpc.ts';
import type { Actor } from '@-/actor';
import type { Id } from '@-/database';
import {
	DotTunnelJsonFileManager,
	getLocalProjectDotTunnelJsonFilepath,
} from '@-/dot-tunnel-json';
import { $try, type TryOk } from 'errok';
import fs from 'node:fs';
import path from 'pathe';

/**
	Loads the data from the saved .tunnel.json file into `context.state` if it exists. This is done lazily when a request is made to the local proxy server, since the browser contains the credentials that will be used to load the tunnel instance data.

	It should only be run once; after the data from the filesystem is loaded, `context.state` should be read from and written to directly.
*/
export const loadSavedTunnelInstanceDataFromDotTunnelJson = ({
	localProjectRootDirpath,
	localProjectWorkingDirpath,
	actor,
}: {
	context: LocalProxyContext;
	localProjectRootDirpath: string;
	localProjectWorkingDirpath: string;
	actor: Actor<'User'>;
}) => ($try(async function*(
	$ok: TryOk<
		{
			tunnelInstanceProxyPreviewId: Id<'TunnelInstanceProxyPreview'>;
			projectLivePreviewIds: Id<'ProjectLivePreview'>[];
		} | null
	>,
) {
	const localProjectDotTunnelJsonFilepath =
		getLocalProjectDotTunnelJsonFilepath({ localProjectRootDirpath });

	if (!fs.existsSync(localProjectDotTunnelJsonFilepath)) {
		return $ok(null);
	}

	const dotTunnelJsonFileManager = yield* DotTunnelJsonFileManager.create({
		dotTunnelJsonFilepath: localProjectDotTunnelJsonFilepath,
	}).safeUnwrap();

	const relativeDirpath = path.relative(
		localProjectRootDirpath,
		localProjectWorkingDirpath,
	);

	const { webappTrpc } = await getWebappTrpc({ actor });

	const localWorkspace = await dotTunnelJsonFileManager.getLocalWorkspace({
		relativeDirpath,
		actorUserId: actor.data.id,
	});

	if (localWorkspace === undefined) {
		return $ok(null);
	}

	const { linkedTunnelInstanceProxyPreviewId } = localWorkspace;
	if (linkedTunnelInstanceProxyPreviewId === null) {
		return $ok(null);
	}

	const tunnelInstanceProxyPreview = await webappTrpc.tunnelInstanceProxyPreview
		.get$projectLivePreviewsData
		.query({
			actor,
			tunnelInstanceProxyPreview: {
				id: linkedTunnelInstanceProxyPreviewId,
			},
		});

	// If the request errored, we should remove it from the local workspace
	if (tunnelInstanceProxyPreview.isErr()) {
		await dotTunnelJsonFileManager.deleteLocalWorkspace({
			relativeDirpath,
			actorUserId: actor.data.id,
		});
		return $ok(null);
	}

	if (tunnelInstanceProxyPreview.value === null) {
		return $ok(null);
	}

	const projectLivePreviewIds = tunnelInstanceProxyPreview.value
		.projectLivePreviews
		.map(
			(livePreview) => livePreview._id,
		);

	return $ok({
		tunnelInstanceProxyPreviewId: tunnelInstanceProxyPreview.value._id,
		projectLivePreviewIds,
	});
}));
