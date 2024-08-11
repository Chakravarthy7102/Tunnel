import { getServerAnalyticsNamespaces } from '#utils/namespaces.ts';
import { createNamespaceProxy } from '@tunnel/namespace';

export function ApiAnalytics_getServerAnalytics(): ReturnType<
	typeof getServerAnalytics
> {
	return getServerAnalytics();
}

export const getServerAnalytics = (): ReturnType<
	typeof getServerAnalyticsNamespaces
> => {
	return createNamespaceProxy(
		() => getServerAnalyticsNamespaces(),
		{},
		[],
	);
};
