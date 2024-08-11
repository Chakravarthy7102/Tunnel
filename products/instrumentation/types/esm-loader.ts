import type { Promisable } from 'type-fest';

export type ModuleFormat =
	| 'builtin'
	| 'dynamic'
	| 'commonjs'
	| 'json'
	| 'module'
	| 'wasm';

export interface Resolved {
	url: string;
	format: ModuleFormat | undefined;
}

export interface Context {
	conditions: string[];
	parentURL: string | undefined;
}

export type Resolve = (
	specifier: string,
	context: Context,
	defaultResolve: Resolve,
	recursiveCall?: boolean,
) => Promisable<Resolved>;

export interface Loaded {
	format: string;
	source: string | ArrayBuffer | SharedArrayBuffer | Uint8Array;
}

export type Load = (
	url: string,
	context: {
		format: string;
		importAssertions: Record<string, string>;
	},
	defaultLoad: Load,
) => Promisable<Loaded>;
