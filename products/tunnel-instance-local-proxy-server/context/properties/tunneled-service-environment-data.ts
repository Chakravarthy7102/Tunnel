import type {
	CreateLocalProxyContextArgs,
	NarrowLocalProxyContextArgs,
} from '#types';
import type { HostEnvironmentType } from '@-/host-environment';
import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';
import { defineProperties } from '@tunnel/context';

// dprint-ignore
interface TunneledServiceEnvironmentDataProperties {
	tunneledServiceEnvironmentData:
		TunneledServiceEnvironmentData<HostEnvironmentType.wrapperCommand> |
		TunneledServiceEnvironmentData<HostEnvironmentType.tunnelShare>;
}

type ContextTunneledServiceEnvironmentDataProperties<
	_$Args extends NarrowLocalProxyContextArgs = NarrowLocalProxyContextArgs,
> = TunneledServiceEnvironmentDataProperties;

/**
	Information about the active tunnel instance (might be null if the user has not associated it with a tunnel instance)
*/
export function createTunneledServiceEnvironmentDataProperties<
	$Args extends NarrowLocalProxyContextArgs,
>(
	args: CreateLocalProxyContextArgs,
): ContextTunneledServiceEnvironmentDataProperties<$Args> {
	return defineProperties<TunneledServiceEnvironmentDataProperties>({
		tunneledServiceEnvironmentData: {
			hostEnvironment: args.hostEnvironment as any,
			organization: null,
			project: null,
			activeProjectLivePreviewId: null,
			projectLivePreviews: {},
			tunnelInstanceProxyPreview: null,
		} satisfies TunneledServiceEnvironmentData<HostEnvironmentType>,
	});
}
