'use client';

import type { TunnelApiRouter, WebappTrpc } from '#types';
import { createTrpcClient, getCreateTrpcClientArgs } from '@-/trpc/client';
import { ApiUrl } from '@-/url/api';
import { createTRPCReact } from '@trpc/react-query';

export const trpcCreateArgs = getCreateTrpcClientArgs({
	siteUrl: typeof window === 'undefined' ?
		'' :
		`${ApiUrl.getWebappUrl({ withScheme: true, fromWindow: true })}/api/trpc`,
});

export const trpcClient: WebappTrpc = createTrpcClient({
	siteUrl: typeof window === 'undefined' ?
		'' :
		`${ApiUrl.getWebappUrl({ withScheme: true, fromWindow: true })}/api/trpc`,
});

export const trpc: ReturnType<typeof createTRPCReact<TunnelApiRouter>> =
	createTRPCReact() as any;
