import { useContextNotifications } from '#hooks/context/notifications.ts';
import type { PageToolbarContext } from '#types';
import { useOnceEffect } from '#utils/effect.ts';
import { useInitializeToolbarState } from '#utils/state.ts';
import { createCid } from '@-/database';
import { HostEnvironmentType } from '@-/host-environment';
import { logger } from '@-/logger';
import { getTunnelInstancePageSecretStorage } from '@-/tunnel-instance-page-secret-storage';
import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import { useMotionValue } from 'framer-motion';
import { useEffect } from 'react';
import { useStore } from 'zustand';
import { usePreloadedActorOrganizationMember } from './preloaded/actor-organization-member.ts';
import { usePreloadedActorUser } from './preloaded/actor-user.ts';
import { usePreloadedCommentThreads } from './preloaded/project-comment-threads.ts';
import { usePreloadedProjectLivePreview } from './preloaded/project-live-preview.ts';
import { usePreloadedProject } from './preloaded/project.ts';
import {
	usePreloadedTunnelInstanceProxyPreview,
} from './preloaded/tunnel-instance-proxy-preview.ts';

export interface CreatePageToolbarContextArgs {
	tunneledServiceEnvironmentData: TunneledServiceEnvironmentData<
		HostEnvironmentType
	>;
}

export function usePageToolbarContext({
	tunneledServiceEnvironmentData,
}: CreatePageToolbarContextArgs): PageToolbarContext {
	const tunnelGlobals = getTunnelGlobals();
	if (!tunnelGlobals) {
		throw new Error('Could not find the global `__tunnel__` variable');
	}

	const { getContext } = tunnelGlobals;
	const context = getContext?.();
	if (context === undefined) {
		throw new Error(
			'The toolbar has not yet set the context on the global tunnel object',
		);
	}

	const { addNotification } = useContextNotifications({ context });
	const initializeToolbarState = useInitializeToolbarState({ context });

	useEffect(() => {
		const tunnelInstancePageSecretStorage =
			getTunnelInstancePageSecretStorage();

		const onAuthorizationSecretUpdate = (event: string) => {
			if (event === 'update') {
				const { actorUserId } = tunnelInstancePageSecretStorage
					.getSync();

				if (actorUserId === null) {
					context.store.setState({
						actor: null,
					});
				}
			}
		};

		void tunnelInstancePageSecretStorage.watch(onAuthorizationSecretUpdate);

		return () => {
			void tunnelInstancePageSecretStorage.unwatch();
		};
	}, []);

	const project = usePreloadedProject({ context });
	usePreloadedProjectLivePreview({ context, project });
	usePreloadedTunnelInstanceProxyPreview({ context, project });
	usePreloadedActorUser({ context });
	usePreloadedActorOrganizationMember({ context });
	usePreloadedCommentThreads({ context });

	context.mousePositionMotionValue = useMotionValue({ x: 0, y: 0 });
	useOnceEffect(() => {
		const updateMousePosition = (ev: { clientX: any; clientY: any }) => {
			context.mousePositionMotionValue.set({ x: ev.clientX, y: ev.clientY });
		};

		window.addEventListener('mousemove', updateMousePosition);

		return () => {
			window.removeEventListener('mousemove', updateMousePosition);
		};
	});

	context.hostEnvironment = tunneledServiceEnvironmentData.hostEnvironment;

	useEffect(() => {
		initializeToolbarState({
			projectLivePreviewId:
				tunneledServiceEnvironmentData.activeProjectLivePreviewId,
			projectId: tunneledServiceEnvironmentData.project?._id ?? null,
		}).then(() => {
			// Check if the git branch is valid
			if (
				tunneledServiceEnvironmentData.hostEnvironment.type ===
					HostEnvironmentType.scriptTag &&
				tunneledServiceEnvironmentData.hostEnvironment.gitMetadata
						.errors[0] !==
					undefined
			) {
				context.store.setState(
					addNotification.action({
						notification: {
							id: createCid(),
							type: 'InvalidGitConfiguration',
							message:
								tunneledServiceEnvironmentData.hostEnvironment.gitMetadata
									.errors[0],
						},
					}),
				);
			}

			context.store.setState({ isLoading: false });
		}).catch((error) => {
			logger.error('Error initializing context:', error);
		}).finally(() => {
		});
	}, [tunneledServiceEnvironmentData.activeProjectLivePreviewId]);

	useEffect(() => {
		const viewAllProjectComments = localStorage.getItem(
			'viewAllProjectComments',
		);

		if (viewAllProjectComments === 'true') {
			context.store.setState({ viewAllProjectComments: true });
		}
	}, []);

	return context;
}

export function useContextStore<$Context extends PageToolbarContext>(
	context: $Context,
): ReturnType<typeof useStore<$Context['store']>>;
export function useContextStore<
	$Context extends PageToolbarContext,
	$Selector extends (state: ReturnType<$Context['store']['getState']>) => any,
>(
	context: $Context,
	selector: $Selector,
): ReturnType<typeof useStore<$Context['store'], ReturnType<$Selector>>>;
export function useContextStore(context: any, selector?: any) {
	return useStore(context.store, selector);
}
