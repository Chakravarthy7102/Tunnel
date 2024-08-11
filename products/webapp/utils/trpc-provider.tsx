'use client';

import { trpc, trpcCreateArgs } from '#utils/trpc.ts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

const trpcReact = trpc as any;

export const TrpcProvider: React.FC<{ children: React.ReactNode }> = (p) => {
	const trpcClient = trpcReact.createClient(trpcCreateArgs);

	const [queryClient] = useState(() => new QueryClient());
	return (
		<trpcReact.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>
				{p.children}
			</QueryClientProvider>
		</trpcReact.Provider>
	);
};
