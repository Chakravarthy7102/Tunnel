import type { DotTunnelJson } from '#types';

export const getDefaultDotTunnelJson = (): DotTunnelJson => ({
	localWorkspaces: [],
	activeLocalWorkspaces: {},
});
