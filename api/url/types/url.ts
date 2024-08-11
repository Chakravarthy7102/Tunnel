import type { TunnelappUrlMetadata } from '#types';

export interface ParsedTunnelappUrl {
	url: globalThis.URL;
	metadata: TunnelappUrlMetadata | null;
}
