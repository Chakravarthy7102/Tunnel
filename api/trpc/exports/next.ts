import { SuperJSON } from '@-/superjson';
import { httpLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AnyTRPCRouter } from '@trpc/server';

export function createTrpcNext<$Router extends AnyTRPCRouter>({
	siteUrl,
}: {
	siteUrl: string;
}): ReturnType<typeof createTRPCNext<$Router>> {
	let baseUrl: string;
	if (typeof window === 'undefined') {
		baseUrl = siteUrl;
	} else {
		// browser should use relative path
		baseUrl = '';
	}

	const trpc = createTRPCNext<$Router>({
		config() {
			return {
				// @ts-expect-error: what
				links: [httpLink({ url: baseUrl, transformer: SuperJSON })],
			};
		},

		/**
			We disable SSR because it doesn't play well with `getServerSideProps`
			@see https://trpc.nio/docs/ssr
		*/
		ssr: false,
	});

	return trpc;
}
