import type {
	createActorProperties,
	createExperimentalProperties,
	createGlobalProperties,
	createHostEnvironmentProperties,
	createHostnameProperties,
	createOnlineProperties,
	createProjectLivePreviewProperties,
	createProjectProperties,
	createTunnelInstanceProperties,
} from '#context/properties/_.ts';
import type {
	HostEnvironment,
	HostEnvironmentType,
	HostnameType,
} from '@-/host-environment';
import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';
import type { MotionValue } from 'framer-motion';
import type { StoreApi } from 'zustand';

export interface CreatePageToolbarContextArgs {
	tunneledServiceEnvironmentData: TunneledServiceEnvironmentData<
		HostEnvironmentType
	>;
}

/**
	Args to type-narrow the state
*/
export interface NarrowPageToolbarContextArgs {
	actorType: 'User' | null;
	isOnline: boolean;
	hostEnvironmentType: HostEnvironmentType;
	hostnameType: HostnameType;
	// There might be a project but not a project live preview, e.g. the Tunnel <script> tag on localhost
	hasProject: boolean;
	hasProjectLivePreview: boolean;
	hasTunnelInstanceProxyPreview: boolean;
	enabledExperimentalFeatures: {
		clickToCode: boolean;
	};
}

// dprint-ignore
export type PageToolbarState<
	$Args extends Partial<NarrowPageToolbarContextArgs> = NarrowPageToolbarContextArgs,
	$MergedArgs extends NarrowPageToolbarContextArgs = $Args & NarrowPageToolbarContextArgs
> =
	ReturnType<typeof createActorProperties<$MergedArgs>> &
	ReturnType<typeof createExperimentalProperties<$MergedArgs>> &
	ReturnType<typeof createGlobalProperties<$MergedArgs>> &
	ReturnType<typeof createHostEnvironmentProperties<$MergedArgs>> &
	ReturnType<typeof createHostnameProperties<$MergedArgs>> &
	ReturnType<typeof createProjectLivePreviewProperties<$MergedArgs>> &
	ReturnType<typeof createProjectProperties<$MergedArgs>> &
	ReturnType<typeof createOnlineProperties<$MergedArgs>> &
	ReturnType<typeof createTunnelInstanceProperties<$MergedArgs>>

export interface PageToolbarContext<
	$Args extends Partial<NarrowPageToolbarContextArgs> =
		NarrowPageToolbarContextArgs,
	$MergedArgs = $Args & NarrowPageToolbarContextArgs,
> {
	__args__: $MergedArgs;

	hostEnvironment: HostEnvironment;
	store: StoreApi<PageToolbarState<$Args & NarrowPageToolbarContextArgs>>;
	mousePositionMotionValue: MotionValue<{ x: number; y: number }>;
}
