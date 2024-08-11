import path from 'pathe';

export function getBinStubsDirpath(
	args:
		| { release: null; monorepoDirpath: string }
		| { release: 'staging' | 'production'; tunnelCliSourceDirpath: string },
) {
	if (args.release === null) {
		return path.join(
			args.monorepoDirpath,
			'products/bin-stubs/generated/__stubs__',
		);
	} else {
		return path.join(args.tunnelCliSourceDirpath, 'bin-stubs/__stubs__');
	}
}

export function prependBinStubsPaths(
	args:
		& {
			pathEnv: string;
		}
		& (
			| { release: null; monorepoDirpath: string }
			| { release: 'staging' | 'production'; tunnelCliSourceDirpath: string }
		),
) {
	return `${getBinStubsDirpath(args)}:${args.pathEnv}`;
}
