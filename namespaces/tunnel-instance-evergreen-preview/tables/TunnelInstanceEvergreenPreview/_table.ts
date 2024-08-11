import { v } from '@-/convex/values';
import { table } from 'corvex';

/** @deprecated - No longer used */
export const TunnelInstanceEvergreenPreview = table(
	'TunnelInstanceEvergreenPreview',
	v.any(),
	(t) =>
		t
			.index('by_projectLivePreview', ['projectLivePreview'])
			.index('by_tunnelInstanceProxyPreview', ['tunnelInstanceProxyPreview']),
)({});
