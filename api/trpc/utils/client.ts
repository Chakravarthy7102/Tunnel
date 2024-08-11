/// <reference lib="dom" />

import type { TrpcClient } from '#types';
import {
	createOnInvalidAuthTokenLink,
} from '#utils/links.ts';
import type { Actor } from '@-/actor';
import { SuperJSON } from '@-/superjson';
import {
	createTRPCClient,
	httpLink,
	type HTTPLinkOptions,
	type Operation,
} from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import type { AnyTRPCRouter } from '@trpc/server';

export type * from '../node_modules/@trpc/client/dist/internals/TRPCUntypedClient.js';

export function getCreateTrpcClientArgs({
	siteUrl,
	httpLinkOptions,
}: {
	siteUrl: string;
	httpLinkOptions?: Partial<HTTPLinkOptions<any>>;
}): any {
	const links = [];

	links.push(httpLink({
		url: siteUrl,
		transformer: SuperJSON as any,
		...httpLinkOptions,
	}));

	return {
		links,
		transformer: SuperJSON as any,
	};
}

export function createTrpcClient<$Router extends AnyTRPCRouter>({
	siteUrl,
	headers,
	fetch,
	onInvalidAuthToken,
}: {
	siteUrl: string;
	headers?: HTTPLinkOptions<any>['headers'];
	fetch?: typeof globalThis.fetch;
	onInvalidAuthToken?(): void;
}): TrpcClient<$Router> {
	const links = [];

	if (onInvalidAuthToken !== undefined) {
		links.push(
			createOnInvalidAuthTokenLink({ onInvalidAuthToken }),
		);
	}

	const createdHttpLink = httpLink({
		url: siteUrl,
		transformer: SuperJSON,
		headers,
		fetch,
	});

	links.push(createdHttpLink);

	const trpcClient = createTRPCClient<$Router>({ links });

	return trpcClient;
}

export function createTrpcReact<AppRouter extends AnyTRPCRouter>({
	siteUrl,
	headers,
	fetch,
	onInvalidAuthToken,
}: {
	siteUrl: string;
	headers?: HTTPLinkOptions<any>['headers'];
	fetch?: HTTPLinkOptions<any>['fetch'];
	onInvalidAuthToken?(): void;
}): { trpc: ReturnType<typeof createTRPCReact<AppRouter>>; links: any } {
	const links = [];

	if (onInvalidAuthToken !== undefined) {
		links.push(
			createOnInvalidAuthTokenLink({
				onInvalidAuthToken,
			}),
		);
	}

	links.push(
		httpLink({
			url: siteUrl,
			transformer: SuperJSON,
			headers,
			fetch,
		}),
	);

	const trpc = createTRPCReact<AppRouter>();

	return { trpc: trpc as any, links };
}

export async function getAuthorizationHeaders({
	getAccessToken,
	op,
}: {
	op: Operation;
	getAccessToken: (args: {
		actor: Actor;
	}) => string | null | Promise<string | null>;
}) {
	if (
		typeof op.input === 'object' &&
		op.input !== null &&
		'actor' in op.input &&
		typeof op.input.actor === 'object' &&
		op.input.actor !== null
	) {
		// The actor will have one property that is the type of the actor
		const accessToken = await getAccessToken({
			actor: op.input.actor as Actor,
		});
		if (accessToken === null) {
			return undefined;
		}

		return {
			'Authorization': `Bearer ${accessToken}`,
		};
	}
}
