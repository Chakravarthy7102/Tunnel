import { cli, type ExecaOptions } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import type { ExecaError } from 'execa';
import path from 'pathe';
import { retry } from 'ts-retry-promise';

export const convexBinFilepath = path.join(
	packageDirpaths.database,
	'node_modules/.bin/convex',
);

export async function convex(
	subcommand: string,
	args: string[],
	options?: ExecaOptions,
) {
	return retry(
		async () =>
			cli.execa(convexBinFilepath, [subcommand, ...args], {
				cwd: packageDirpaths.database,
				stdio: 'inherit',
				...options,
				env: {
					...options?.env,
				},
			}),
		{
			retryIf(error) {
				const execaError = error as Partial<ExecaError>;
				return (
					(execaError.stderr !== undefined &&
						(execaError.stderr.includes('fetch failed') ||
							execaError.stderr.includes('ECONNRESET'))) ||
					(execaError.stdout !== undefined &&
						(execaError.stdout.includes('fetch failed') ||
							execaError.stdout.includes('ECONNRESET')))
				);
			},
			timeout: 'INFINITELY',
		},
	);
}
