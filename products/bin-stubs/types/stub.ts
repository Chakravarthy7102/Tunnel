import type { Promisable } from 'type-fest';

export interface BinStub {
	commandName: string;
	getStub(
		args:
			| { release: null; monorepoDirpath: string }
			| {
				release: 'staging' | 'production';
				tunnelCliSourceDirpath: string;
			},
	): Promisable<string>;
}
