import { getWebappTrpc } from '#utils/trpc.ts';
import type { Actor } from '@-/actor';
import { getConvex } from '@-/convex/cli';
import { type Id } from '@-/database';
import { getVapi } from '@-/database/vapi';
import type { HostEnvironment, HostEnvironmentType } from '@-/host-environment';
import { logger } from '@-/logger';
import type {
	TunneledServiceData,
	TunneledServiceEnvironmentData,
} from '@-/tunneled-service-environment';
import memoize from 'memoize';

/**
	The tunneled service environment data for a "tunnelShare" environment is cached based on the URL it's accessed from (this allows a single "tunnel share" to share multiple project live previews, which the user would be able to selectively share and choose from in the toolbar).

	Can return null if there is no associated project live preview with the specified URL.
*/
export const getTunnelShareTunneledServiceEnvironmentData = memoize(async ({
	actor,
	projectLivePreviewUrl,
	hostEnvironment,
}: {
	actor: Actor<'User'>;
	projectLivePreviewUrl: string;
	hostEnvironment: HostEnvironment<
		HostEnvironmentType.tunnelShare
	>;
}): Promise<
	TunneledServiceEnvironmentData<HostEnvironmentType.tunnelShare> | null
> => {
	const { webappTrpc } = await getWebappTrpc({ actor });

	const initialTunneledServiceData:
		| TunneledServiceData<HostEnvironmentType.tunnelShare>
		| null = await (async () => {
			const initialTunneledServiceProjectLivePreviewDataSelection =
				(await webappTrpc.projectLivePreview
					.get$recursiveTunneledServiceEnvironmentData.query({
						actor,
						projectLivePreview: {
							url: projectLivePreviewUrl,
						},
					})).unwrapOrThrow();

			if (
				// The project live preview with the specified url was not found
				initialTunneledServiceProjectLivePreviewDataSelection === null ||
				// The project live preview doesn't have a linked tunnel instance (which shouldn't happen when using "tunnel share")
				initialTunneledServiceProjectLivePreviewDataSelection
						.linkedTunnelInstanceProxyPreview ===
					null
			) {
				return null;
			}

			const {
				organization,
				project,
				linkedTunnelInstanceProxyPreview,
				...projectLivePreview
			} = initialTunneledServiceProjectLivePreviewDataSelection;

			const initialTunneledServiceData: TunneledServiceData<
				HostEnvironmentType.tunnelShare
			> = {
				organization,
				project,
				projectLivePreviews: {
					[projectLivePreview._id]: projectLivePreview,
				},
				activeProjectLivePreviewId: projectLivePreview._id,
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
				tunnelInstanceProxyPreview: linkedTunnelInstanceProxyPreview,
			};

			logger.debug(
				'Initial tunneled service data:',
				initialTunneledServiceData,
			);

			return initialTunneledServiceData;
		})();

	if (initialTunneledServiceData === null) {
		return null;
	}

	const cachedTunneledServiceEnvironmentData = {
		...initialTunneledServiceData,
		hostEnvironment,
	};

	return cachedTunneledServiceEnvironmentData;
}, { cacheKey: (args) => args[0].projectLivePreviewUrl });

export const getWrapperCommandTunneledServiceEnvironmentData = memoize(async ({
	actor,
	userLocalWorkspaceId,
	hostEnvironment,
}: {
	actor: Actor<'User'> | null;
	userLocalWorkspaceId: Id<'UserLocalWorkspace'> | null;
	hostEnvironment: HostEnvironment<HostEnvironmentType.wrapperCommand>;
}): Promise<
	TunneledServiceEnvironmentData<HostEnvironmentType.wrapperCommand>
> => {
	const initialTunneledServiceData: TunneledServiceData<HostEnvironmentType> =
		await (async () => {
			if (
				actor === null ||
				userLocalWorkspaceId === null
			) {
				if (actor === null) {
					logger.debug(
						'The user is not logged in; returning null environment',
					);
				} else {
					logger.debug(
						'The tunnel has not been initialized; returning null environment',
					);
				}

				return {
					organization: null,
					project: null,
					activeProjectLivePreviewId: null,
					projectLivePreviews: {},
					tunnelInstanceProxyPreview: null,
				};
			}

			const convex = await getConvex({ actorUserId: actor.data.id });
			const initialTunneledServiceTunnelInstanceDataSelection =
				await (async () => {
					try {
						const vapi = await getVapi();
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
				})();

			const initialTunneledServiceData =
				// Tunnel instance doesn't exist, return null environment
				initialTunneledServiceTunnelInstanceDataSelection === null ?
					{
						organization: null,
						project: null,
						activeProjectLivePreviewId: null,
						projectLivePreviews: {},
						tunnelInstanceProxyPreview: null,
					} :
					(() => {
						const {
							project: {
								organization,
								...project
							},
							linkedTunnelInstanceProxyPreview,
						} = initialTunneledServiceTunnelInstanceDataSelection;

						const projectLivePreviews =
							linkedTunnelInstanceProxyPreview === null ?
								{} :
								Object.fromEntries(
									linkedTunnelInstanceProxyPreview.projectLivePreviews.map((
										livePreview,
									) => [
										livePreview._id,
										livePreview,
									]),
								);

						// TODO: save the user's active project live preview
						const activeProjectLivePreviewId =
							linkedTunnelInstanceProxyPreview?.projectLivePreviews[0]?._id ??
								null;

						return {
							organization,
							project,
							projectLivePreviews,
							activeProjectLivePreviewId,
							tunnelInstanceProxyPreview: linkedTunnelInstanceProxyPreview,
						} satisfies TunneledServiceData<
							HostEnvironmentType.wrapperCommand
						>;
					})();

			logger.debug(
				'Initial tunneled service data:',
				initialTunneledServiceData,
			);

			return initialTunneledServiceData;
		})();

	const cachedTunneledServiceEnvironmentData = {
		...initialTunneledServiceData,
		hostEnvironment,
	};

	return cachedTunneledServiceEnvironmentData;
}, {
	cacheKey: ([{ actor, userLocalWorkspaceId }]) =>
		JSON.stringify({
			actor,
			userLocalWorkspaceId,
		}),
});
