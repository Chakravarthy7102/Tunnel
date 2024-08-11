import type { RouteThis } from '#types';
import { isContext } from '#utils/context.ts';
import { loadSavedTunnelInstanceDataFromDotTunnelJson } from '#utils/dot-tunnel-json.ts';
import {
	getTunnelShareTunneledServiceEnvironmentData,
	getWrapperCommandTunneledServiceEnvironmentData,
} from '#utils/tunneled-service-environment-data.ts';
import { HostEnvironmentType } from '@-/host-environment';
import { logger } from '@-/logger';
import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';
import { normalizeProjectLivePreviewUrl, parseTunnelappUrl } from '@-/url';
import type { FastifyReply, FastifyRequest } from 'fastify';
import onetime from 'onetime';
import { outdent } from 'outdent';
import safeUrl from 'safer-url';
import invariant from 'tiny-invariant';

const onetimeLoadSavedTunnelInstanceDataFromDotTunnelJson = onetime(
	loadSavedTunnelInstanceDataFromDotTunnelJson,
);

let isDotTunnelJsonLoaded = false;

/**
	We load the tunneled service environment data based on the CLI state, as we derive and synchronize the browser state with the CLI state so that the user can use multiple browsers locally without having to re-initialize the state each time.
*/
export async function GET(
	this: RouteThis,
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const { context } = this;

	if (request.headers.host === undefined) {
		return reply.status(400).send('Missing "host" header');
	}

	const hostUrl = safeUrl(request.url, `https://${request.headers.host}`);
	if (hostUrl === null) {
		return reply.status(400).send('Invalid "host" header');
	}

	const parsedTunnelappUrl = parseTunnelappUrl(hostUrl);

	const projectLivePreviewUrl = normalizeProjectLivePreviewUrl(
		parsedTunnelappUrl.url,
	);

	let tunneledServiceEnvironmentData:
		| TunneledServiceEnvironmentData<HostEnvironmentType.wrapperCommand>
		| TunneledServiceEnvironmentData<HostEnvironmentType.tunnelShare>;

	switch (context.hostEnvironment.type) {
		case HostEnvironmentType.tunnelShare: {
			invariant(
				isContext(context, { actorType: 'User' }),
				'A host environment of "tunnelShare" must contain an authenticated user',
			);

			const tunneledServiceEnvironmentDataOrNull =
				await getTunnelShareTunneledServiceEnvironmentData({
					actor: context.state.actor,
					projectLivePreviewUrl,
					hostEnvironment: context.hostEnvironment,
				});

			/**
				`tunneledServiceEnvironmentData` is null if data about the project live preview/tunnel instance could not be retrieved (e.g. it was deleted). In this case, exit the program
			*/
			if (tunneledServiceEnvironmentDataOrNull === null) {
				logger.debug(
					'Could not find project live preview with URL %s',
					projectLivePreviewUrl,
				);
				return reply.status(404).send(
					`Could not find project live preview with URL ${projectLivePreviewUrl}`,
				);
			}

			tunneledServiceEnvironmentData = tunneledServiceEnvironmentDataOrNull;
			break;
		}

		case HostEnvironmentType.wrapperCommand: {
			if (isContext(context, { actorType: 'User' })) {
				// For the wrapper command, we should try and load a saved tunnel instance from the `.tunnel.json` file
				if (
					context.state.tunnelInstanceProxyPreviewId === null &&
					!isDotTunnelJsonLoaded
				) {
					const savedTunnelInstanceData =
						(await onetimeLoadSavedTunnelInstanceDataFromDotTunnelJson(
							{
								context,
								actor: context.state.actor,
								localProjectRootDirpath:
									context.state.localProjectEnvironment.rootDirpath,
								localProjectWorkingDirpath:
									context.state.localProjectEnvironment.workingDirpath,
							},
						)).unwrapOrThrow();

					isDotTunnelJsonLoaded = true;

					if (savedTunnelInstanceData !== null) {
						// @ts-expect-error: TODO
						context.state.tunnelInstanceProxyPreviewId =
							savedTunnelInstanceData.tunnelInstanceProxyPreviewId;
					}
				}

				tunneledServiceEnvironmentData =
					await getWrapperCommandTunneledServiceEnvironmentData({
						actor: context.state.actor,
						userLocalWorkspaceId: context.state.userLocalWorkspaceId,
						hostEnvironment: context.hostEnvironment,
					});
			} else {
				tunneledServiceEnvironmentData =
					await getWrapperCommandTunneledServiceEnvironmentData({
						actor: context.state.actor,
						userLocalWorkspaceId: context.state.userLocalWorkspaceId,
						hostEnvironment: context.hostEnvironment,
					});
			}

			break;
		}

		default: {
			throw new Error(
				`Unknown host environment type: ${context.hostEnvironment.type}`,
			);
		}
	}

	return reply.type('text/javascript').send(
		outdent`
			globalThis.__TUNNELED_SERVICE_ENVIRONMENT_DATA__ = ${
			JSON.stringify(tunneledServiceEnvironmentData)
		}
			document.currentScript.remove()
		`,
	);
}
