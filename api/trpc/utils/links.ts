import { TRPCClientError, type TRPCLink } from '@trpc/client';
import type { AnyTRPCRouter } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import type { Promisable } from 'type-fest';

function transformResultInner(response: any, runtime: any) {
	if ('error' in response) {
		const error = runtime.transformer.deserialize(response.error);
		return {
			ok: false,
			error: {
				...response,
				error,
			},
		};
	}

	const result = {
		...response.result,
		...((!response.result.type || response.result.type === 'data') && {
			type: 'data',
			data: runtime.transformer.deserialize(response.result.data),
		}),
	};
	return { ok: true, result };
}

function isObject(value: unknown): value is Record<string, unknown> {
	// check that value is object
	return Boolean(value) && !Array.isArray(value) && typeof value === 'object';
}

export function transformResult(response: any, runtime: any): any {
	let result;
	try {
		// Use the data transformers on the JSON-response
		result = transformResultInner(response, runtime);
	} catch {
		throw new TRPCClientError('Unable to transform response from server');
	}

	// check that output of the transformers is a valid TRPCResponse
	if (
		!result.ok &&
		(!isObject(result.error.error) ||
			typeof result.error.error.code !== 'number')
	) {
		throw new TRPCClientError('Badly formatted response from server');
	}

	if (result.ok && !isObject(result.result)) {
		throw new TRPCClientError('Badly formatted response from server');
	}

	return result;
}

export const createOnInvalidAuthTokenLink: ({
	onInvalidAuthToken,
}: {
	onInvalidAuthToken(): Promisable<void>;
}) => TRPCLink<AnyTRPCRouter> = ({ onInvalidAuthToken }: {
	onInvalidAuthToken(): Promisable<void>;
}) =>
() =>
({ next, op }) =>
	observable((observer) => {
		const unsubscribe = next(op).subscribe({
			next(value) {
				observer.next(value);
			},
			error(error) {
				if (
					error.message.includes('Missing authentication credentials') ||
					error.message.includes('Invalid authentication credentials')
				) {
					void Promise.resolve(onInvalidAuthToken()).finally(() => {
						observer.error(error);
					});
				} else {
					observer.error(error);
				}
			},
			complete() {
				observer.complete();
			},
		});

		return unsubscribe;
	});
