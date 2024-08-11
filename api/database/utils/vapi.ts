import { getBundledDatabaseApiVersion } from '#constants/api-version.ts';
import type { api } from '#types';

const functionName = Symbol.for('functionName');

let activeDatabaseApiVersion: number | undefined;
export function updateDatabaseApiVersion(version: number) {
	activeDatabaseApiVersion = version;
}

/**
	This function is deliberately asynchronous to prevent it from being called in client-side React components (which should use `useVapi` instead)
*/
export async function getVapi(): Promise<typeof api> {
	return createVapi(
		activeDatabaseApiVersion ?? Number(getBundledDatabaseApiVersion()),
	);
}

// Copied from Convex
export function createVapi(
	databaseVersion: number,
	pathParts: string[] = [],
): any {
	const handler: ProxyHandler<object> = {
		get(_, prop: string | symbol) {
			if (typeof prop === 'string') {
				const newParts = [
					...pathParts,
					prop === 'v' ? `v${databaseVersion}` : prop,
				];
				return createVapi(databaseVersion, newParts);
			} else if (prop === functionName) {
				if (pathParts.length < 2) {
					const found = ['api', ...pathParts].join('.');
					throw new Error(
						`API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${found}\``,
					);
				}

				const path = pathParts.slice(0, -1).join('/');
				const exportName = pathParts.at(-1);
				if (exportName === 'default') {
					return path;
				} else {
					return path + ':' + exportName;
				}
			} else if (prop === Symbol.toStringTag) {
				return 'FunctionReference';
			} else {
				return undefined;
			}
		},
	};

	return new Proxy({}, handler);
}
