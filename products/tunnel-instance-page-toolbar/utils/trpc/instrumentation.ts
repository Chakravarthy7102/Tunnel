import type { PageToolbarContext } from '#types';
import { HostEnvironmentType, isHostEnvironment } from '@-/host-environment';
import type { InstrumentationTrpc } from '@-/instrumentation/api';
import { createTrpcClient } from '@-/trpc/client';
import onetime from 'onetime';
import invariant from 'tiny-invariant';

export const getInstrumentationTrpc: (args: {
	context: PageToolbarContext<{
		hostEnvironmentType: HostEnvironmentType.wrapperCommand;
	}>;
}) => {
	instrumentationTrpc: InstrumentationTrpc;
} = onetime(({ context }) => {
	invariant(
		isHostEnvironment(context.hostEnvironment, {
			type: HostEnvironmentType.wrapperCommand,
		}),
		'todo',
	);

	const instrumentationTrpc: InstrumentationTrpc = createTrpcClient({
		siteUrl:
			`http://localhost:${context.hostEnvironment.localProjectEnvironment.localTunnelProxyServerPortNumber}/api/instrumentation/${context.hostEnvironment.localProjectEnvironment.localServicePortNumber}/trpc`,
	});

	return { instrumentationTrpc };
});
