#!/usr/bin/env tsx

import { logger } from '@-/logger';
import { applyMigrationsAndDeploy } from './utils/migration.ts';

const result = await applyMigrationsAndDeploy({ appEnv: 'development' });
if (result.isErr()) {
	logger.error(result.error);
	process.exit(1);
}
