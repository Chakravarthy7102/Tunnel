import * as localProxyProperties from '#namespaces/_.ts';
import {
	createNamespaceProxy,
	createNestedNamespace,
	type NestedNamespace,
} from '@tunnel/namespace';
import onetime from 'onetime';

export const getLocalProxyNamespaces = onetime(() =>
	createNestedNamespace(localProxyProperties)
);

export function getLocalProxy():
	& NestedNamespace<typeof localProxyProperties>
	& {
		context: { service: string };
	}
{
	const context = {
		service: '@-/tunnel-instance-local-proxy-server',
	};

	return createNamespaceProxy(getLocalProxyNamespaces, { context }, []);
}
