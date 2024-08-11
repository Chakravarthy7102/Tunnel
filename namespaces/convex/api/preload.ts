import { env } from '@-/env';
import { preloadQuery } from 'convex/nextjs';
import type { Preloaded } from 'convex/react';
import type { FunctionReference } from 'convex/server';
import { sha256 } from 'js-sha256';
import sortKeys from 'sort-keys';

export async function ApiConvex_preloadProtectedQuery<
	$Query extends FunctionReference<'query'>,
>(
	functionReference: $Query,
	args: $Query['_args'],
	options: { token: string | null },
): Promise<Preloaded<$Query>> {
	const argsToHash = { ...args };
	delete argsToHash.paginationOpts;
	delete argsToHash.token;
	const hash = sha256(
		env('CONVEX_SECRET') +
			JSON.stringify(sortKeys(argsToHash, { deep: true })),
	);

	const preloaded = await preloadQuery(
		functionReference,
		{
			...args,
			hash,
			...(options.token === null ? {} : { token: options.token }),
		},
	);

	return preloaded;
}
