import type { TunneledServiceEnvironmentData } from '@-/tunneled-service-environment';

export interface TunnelServiceWorkerGlobals {
	tunneledServiceEnvironmentData: TunneledServiceEnvironmentData<any>;
}
