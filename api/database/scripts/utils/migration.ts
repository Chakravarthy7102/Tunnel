import { packageDirpaths } from '@-/packages-config';
import { ok, type Result } from 'errok';
import path from 'pathe';
import { convex } from './convex.ts';

export const migrationsDirpath = path.join(
	packageDirpaths.database,
	'convex/migrations',
);

export async function applyMigrationsAndDeploy({
	appEnv,
	watch = false,
}: {
	appEnv: 'development' | 'production';
	migrationBatchSize?: number;
	migrations?: string[];
	deployArgs?: string[];
	watch?: boolean;
}): Promise<Result<void, Error>> {
	if (appEnv === 'development' && watch) {
		await convex('dev', [], {
			env: {
				NODE_ENV: 'development',
			},
		});
	} else {
		await convex('deploy', [], {
			env: {
				NODE_ENV: appEnv,
			},
		});
	}

	return ok();
}
