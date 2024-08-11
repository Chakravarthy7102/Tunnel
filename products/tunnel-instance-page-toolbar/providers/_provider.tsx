import type { PageToolbarContext } from '#types';
import { isContext, useContextStore } from '#utils/context/_.ts';
import { select } from '@-/client-doc';
import { getInclude } from '@-/database/selection-utils';
import { User_$profileData } from '@-/database/selections';
import { HostEnvironmentType } from '@-/host-environment';
import Spaces from '@ably/spaces';
import { SpaceProvider, SpacesProvider, useSpace } from '@ably/spaces/react';
import Ably from 'ably/promises.js';
import { type PropsWithChildren, useEffect, useRef } from 'react';
import { ProjectCommentsProvider } from './comments.tsx';
import { TunnelInstanceCliProvider } from './tunnel-instance-cli.tsx';
import { VideoCallProvider } from './video-call.tsx';

export function ToolbarProvider({
	children,
	context,
}: PropsWithChildren<{ context: PageToolbarContext }>) {
	let component = children;
	const state = useContextStore(context);
	const ablyRealtime = useRef<Ably.Realtime | null>(null);
	const ablySpaces = useRef<Spaces | null>(null);

	if (isContext(context, state, { isOnline: true })) {
		if (
			isContext(context, state, {
				hostEnvironmentType: HostEnvironmentType.wrapperCommand,
				hostnameType: 'local',
				hasTunnelInstanceProxyPreview: true,
			})
		) {
			component = (
				<TunnelInstanceCliProvider context={context}>
					{component}
				</TunnelInstanceCliProvider>
			);
		}

		if (
			isContext(context, state, {
				actorType: 'User',
				hasProject: true,
			})
		) {
			component = (
				<ProjectCommentsProvider context={context}>
					{component}
				</ProjectCommentsProvider>
			);

			if (
				isContext(context, state, {
					actorType: 'User',
					hasProjectLivePreview: true,
				})
			) {
				ablyRealtime.current ??= new Ably.Realtime({
					tokenDetails: context.store.getState().ablyTokenDetails,
					clientId: context.store.getState().actor.data.id,
					closeOnUnload: false,
					authCallback() {},
				});
				ablySpaces.current ??= new Spaces(ablyRealtime.current);
				component = (
					<SpacesProvider client={ablySpaces.current}>
						<SpaceProvider
							name={context.store.getState().projectLivePreviewId}
						>
							<SpaceProfileDataProvider context={context} />
							<VideoCallProvider context={context}>
								{component}
							</VideoCallProvider>
						</SpaceProvider>
					</SpacesProvider>
				);
			}
		}
	}

	return component;
}

function SpaceProfileDataProvider({ context }: {
	context: PageToolbarContext<{
		actorType: 'User';
		hasProjectLivePreview: true;
	}>;
}) {
	const space = useSpace();
	const state = useContextStore(context);
	const actorUser = select(
		state,
		'User',
		state.actor.data.id,
		getInclude(User_$profileData),
	);

	useEffect(() => {
		if (space.enter === undefined) {
			return;
		}

		void space.enter(actorUser);
	}, [space.enter]);

	return null;
}
