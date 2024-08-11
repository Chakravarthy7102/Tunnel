import { getBinStubsDirpath, prependBinStubsPaths } from '@-/bin-stubs';
import { RELEASE } from '@-/env/app';
import type { LocalProjectEnvironment } from '@-/local-project';
import childProcess from 'node:child_process';
import path from 'pathe';

const childProcess_fork = childProcess.fork.bind(childProcess);
const childProcess_spawn = childProcess.spawn.bind(childProcess);
const childProcess_spawnSync = childProcess.spawnSync.bind(childProcess);
const childProcess_exec = childProcess.exec.bind(childProcess);
const childProcess_execSync = childProcess.execSync.bind(childProcess);

function joinPaths(...paths: (string | undefined | null)[]) {
	const pathsToJoin: string[] = [];
	for (const maybePath of paths) {
		if (maybePath) {
			pathsToJoin.push(maybePath);
		}
	}

	return pathsToJoin.join(':');
}

/**
	We need to make sure that the PATH environment variable always prioritizes `bin-stubs`
*/
export function patchChildProcessMethods({
	localProjectEnvironment,
}: {
	localProjectEnvironment: LocalProjectEnvironment;
}) {
	const getBinStubsArgs = ({ pathEnv }: { pathEnv: string }) =>
		RELEASE === null ?
			{
				pathEnv,
				release: RELEASE,
				monorepoDirpath: path.normalize(
					process.env.TUNNEL_MONOREPO_DIRPATH ??
						(() => {
							throw new Error(
								'TUNNEL_MONOREPO_DIRPATH must be set in the environment for a development release',
							);
						})(),
				),
			} :
			{
				pathEnv,
				release: RELEASE,
				tunnelCliSourceDirpath: localProjectEnvironment.tunnelCliSourceDirpath,
			};

	const getEnvAugmentation = ({
		pathEnvWithBinStubs,
	}: {
		pathEnvWithBinStubs: string;
	}) => ({
		PATH: pathEnvWithBinStubs,
		TUNNEL_RELEASE: process.env.TUNNEL_RELEASE,
		TUNNEL_LOCAL_PROJECT_ENVIRONMENT:
			process.env.TUNNEL_LOCAL_PROJECT_ENVIRONMENT,
		TUNNEL_YAML_CONFIG: process.env.TUNNEL_YAML_CONFIG,
		TUNNEL_MONOREPO_DIRPATH: process.env.TUNNEL_MONOREPO_DIRPATH,
		TUNNEL_PORT: process.env.TUNNEL_PORT,
	});

	childProcess.spawnSync = ((
		command: string,
		maybeArgsOrOptions?: Array<string> | { env?: Record<string, string> },
		maybeOptions?: { env?: Record<string, string> },
	) => {
		const binStubsArgs = getBinStubsArgs({
			pathEnv: joinPaths(maybeOptions?.env?.PATH, process.env.PATH),
		});

		if (command === process.execPath) {
			command = path.join(getBinStubsDirpath(binStubsArgs), 'node');
		}

		const pathEnvWithBinStubs = prependBinStubsPaths(binStubsArgs);
		const envAugmentation = getEnvAugmentation({ pathEnvWithBinStubs });

		let args: Array<string>;
		let options: Record<string, unknown>;

		if (maybeArgsOrOptions === undefined) {
			args = [];
			options = {
				env: {
					...process.env,
					...envAugmentation,
				},
			};
		} else {
			const argsOrOptions = maybeArgsOrOptions;
			if (Array.isArray(argsOrOptions)) {
				args = argsOrOptions;
				options = {
					...maybeOptions,
					env: maybeOptions?.env === undefined ?
						{
							...process.env,
							...envAugmentation,
						} :
						{
							...maybeOptions.env,
							...envAugmentation,
						},
				};
			} else {
				args = [];
				options = {
					...argsOrOptions,
					env: argsOrOptions.env === undefined ?
						{ ...process.env, ...envAugmentation } :
						{
							...argsOrOptions.env,
							...envAugmentation,
						},
				};
			}
		}

		return childProcess_spawnSync(command, args, options);
	}) as any;

	childProcess.spawn = ((
		command: string,
		maybeArgsOrOptions?: Array<string> | { env?: Record<string, string> },
		maybeOptions?: { env?: Record<string, string> },
	) => {
		const binStubsArgs = getBinStubsArgs({
			pathEnv: joinPaths(maybeOptions?.env?.PATH, process.env.PATH),
		});

		if (command === process.execPath) {
			command = path.join(getBinStubsDirpath(binStubsArgs), 'node');
		}

		const pathEnvWithBinStubs = prependBinStubsPaths(binStubsArgs);
		const envAugmentation = getEnvAugmentation({ pathEnvWithBinStubs });

		let args: Array<string>;
		let options: Record<string, unknown>;

		if (maybeArgsOrOptions === undefined) {
			args = [];
			options = {
				env: {
					...process.env,
					...envAugmentation,
				},
			};
		} else {
			const argsOrOptions = maybeArgsOrOptions;
			if (Array.isArray(argsOrOptions)) {
				args = argsOrOptions;
				options = {
					...maybeOptions,
					env: maybeOptions?.env === undefined ?
						{
							...process.env,
							...envAugmentation,
						} :
						{
							...maybeOptions.env,
							...envAugmentation,
						},
				};
			} else {
				args = [];
				options = {
					...argsOrOptions,
					env: argsOrOptions.env === undefined ?
						{
							...process.env,
							...envAugmentation,
						} :
						{
							...argsOrOptions.env,
							...envAugmentation,
						},
				};
			}
		}

		return childProcess_spawn(command, args, options);
	}) as any;

	childProcess.fork = ((
		modulePath: string,
		maybeArgsOrOptions?: Array<string> | { env?: Record<string, string> },
		maybeOptions?: { env?: Record<string, string> },
	) => {
		const binStubsArgs = getBinStubsArgs({
			pathEnv: joinPaths(maybeOptions?.env?.PATH, process.env.PATH),
		});

		const pathEnvWithBinStubs = prependBinStubsPaths(binStubsArgs);
		const envAugmentation = getEnvAugmentation({ pathEnvWithBinStubs });

		let args: Array<string>;
		let options: Record<string, unknown>;

		if (maybeArgsOrOptions === undefined) {
			args = [];
			options = {
				env: {
					...process.env,
					...envAugmentation,
				},
			};
		} else {
			const argsOrOptions = maybeArgsOrOptions;
			if (Array.isArray(argsOrOptions)) {
				args = argsOrOptions;
				options = {
					...maybeOptions,
					env: maybeOptions?.env === undefined ?
						{
							...process.env,
							...envAugmentation,
						} :
						{
							...maybeOptions.env,
							...envAugmentation,
						},
				};
			} else {
				args = [];
				options = {
					...argsOrOptions,
					env: argsOrOptions.env === undefined ?
						{
							...process.env,
							...envAugmentation,
						} :
						{
							...argsOrOptions.env,
							...envAugmentation,
						},
				};
			}
		}

		if (options.execPath === undefined) {
			options.execPath = path.join(
				getBinStubsDirpath(binStubsArgs),
				'node',
			);
		}

		return childProcess_fork(modulePath, args, options);
	}) as any;

	childProcess.execSync = ((
		command: string,
		maybeOptions?: { env?: Record<string, string> },
	) => {
		const binStubsArgs = getBinStubsArgs({
			pathEnv: joinPaths(maybeOptions?.env?.PATH, process.env.PATH),
		});

		if (command === process.execPath) {
			command = path.join(getBinStubsDirpath(binStubsArgs), 'node');
		}

		const pathEnvWithBinStubs = prependBinStubsPaths(binStubsArgs);
		const envAugmentation = getEnvAugmentation({ pathEnvWithBinStubs });

		let options: Record<string, unknown>;

		if (maybeOptions === undefined) {
			options = {
				env: {
					...process.env,
					...envAugmentation,
				},
			};
		} else {
			options = {
				...maybeOptions,
				env: maybeOptions.env === undefined ?
					{
						...process.env,
						...envAugmentation,
					} :
					{
						...maybeOptions.env,
						...envAugmentation,
					},
			};
		}

		return childProcess_execSync(command, options);
	}) as any;

	childProcess.exec = ((
		command: string,
		maybeOptionsOrCallback?:
			| { env?: Record<string, string> }
			| ((...args: unknown[]) => void),
		maybeCallback?: (...args: unknown[]) => void,
	) => {
		let options;
		let callback;

		const binStubsArgs = getBinStubsArgs({
			pathEnv: joinPaths(
				(maybeOptionsOrCallback as any)?.env?.PATH,
				process.env.PATH,
			),
		});

		if (command === process.execPath) {
			command = path.join(getBinStubsDirpath(binStubsArgs), 'node');
		}

		const pathEnvWithBinStubs = prependBinStubsPaths(binStubsArgs);
		const envAugmentation = getEnvAugmentation({ pathEnvWithBinStubs });

		if (typeof maybeOptionsOrCallback === 'function') {
			options = {
				env: {
					...process.env,
					...envAugmentation,
				},
			};
			callback = maybeOptionsOrCallback;
		} else {
			const maybeOptions = maybeOptionsOrCallback;
			options = {
				...maybeOptions,
				env: maybeOptions?.env === undefined ?
					{
						...process.env,
						...envAugmentation,
					} :
					{
						...maybeOptions.env,
						...envAugmentation,
					},
			};
			callback = maybeCallback;
		}

		return childProcess_exec(command, options, callback);
	}) as any;
}
