import { v } from '@-/convex/values';

export const tunnelInstanceProxyPreviewInputValidator = v.union(
	v.object({ id: v.id('TunnelInstanceProxyPreview') }),
	v.object({ id: v.string() }),
);
