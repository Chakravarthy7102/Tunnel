import type { PageToolbarContext } from '#types';
import { HostEnvironmentType, isHostEnvironment } from '@-/host-environment';
import {
	createTrpcClient,
} from '@-/trpc/client';
import type { LocalProxyTrpc } from '@-/tunnel-instance-local-proxy-server/api';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import onetime from 'onetime';
import invariant from 'tiny-invariant';

export const getLocalProxyTrpc: (args: {
	context: PageToolbarContext<{
		hostEnvironmentType: HostEnvironmentType.wrapperCommand;
		hostnameType: 'local';
	}>;
}) => {
	localProxyTrpc: LocalProxyTrpc;
} = onetime(({ context }) => {
	invariant(
		isHostEnvironment(context.hostEnvironment, {
			type: HostEnvironmentType.wrapperCommand,
		}),
		'only the wrapper command can interact with the local proxy trpc server',
	);

	const tunnelGlobals = getTunnelGlobals();
	if (!tunnelGlobals) {
		throw new Error('Could not find the global `__tunnel__` variable');
	}

	const { nativeFetch } = tunnelGlobals;

	const localProxyTrpc: LocalProxyTrpc = createTrpcClient({
		siteUrl:
			`http://localhost:${context.hostEnvironment.localProjectEnvironment.localTunnelProxyServerPortNumber}/__tunnel/api/trpc`,
		fetch: nativeFetch,
	});

	return { localProxyTrpc };
});
