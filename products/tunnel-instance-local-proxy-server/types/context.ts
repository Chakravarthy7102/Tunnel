import type {
	createActorProperties,
	createLocalProjectProperties,
	createOnlineProperties,
	createProjectLivePreviewProperties,
	createTunneledServiceEnvironmentDataProperties,
} from '#context/properties/_.ts';
import type { Actor } from '@-/actor';
import type { HostEnvironment } from '@-/host-environment';
import type {
	LocalProjectEnvironment,
	LocalProjectRuntime,
} from '@-/local-project';

export interface CreateLocalProxyContextArgs {
	actor: Actor<'User'> | null;
	hostEnvironment: HostEnvironment;
	localProjectEnvironment: LocalProjectEnvironment;
	localProjectRuntime: LocalProjectRuntime;
}

export interface NarrowLocalProxyContextArgs {
	isOnline: boolean;
	actorType: 'User' | null;
	isApplicationProcessRunning: boolean;
	hasProjectLivePreview: boolean;
}

// dprint-ignore
type LocalProxyState<
	$Args extends Partial<NarrowLocalProxyContextArgs> = NarrowLocalProxyContextArgs,
	$MergedArgs extends NarrowLocalProxyContextArgs = $Args & NarrowLocalProxyContextArgs
> =
	ReturnType<typeof createActorProperties<$MergedArgs>> &
	ReturnType<typeof createTunneledServiceEnvironmentDataProperties<$MergedArgs>> &
	ReturnType<typeof createProjectLivePreviewProperties<$MergedArgs>> &
	ReturnType<typeof createOnlineProperties<$MergedArgs>> &
	ReturnType<typeof createLocalProjectProperties<$MergedArgs>>

export interface LocalProxyContext<
	$Args extends Partial<NarrowLocalProxyContextArgs> =
		NarrowLocalProxyContextArgs,
> {
	state: LocalProxyState<$Args & NarrowLocalProxyContextArgs>;
	hostEnvironment: HostEnvironment;
}
