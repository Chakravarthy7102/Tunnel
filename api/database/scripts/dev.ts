#!/usr/bin/env tsx

import { applyMigrationsAndDeploy } from './utils/migration.ts';

(await applyMigrationsAndDeploy({ watch: true, appEnv: 'development' }))
	.unwrapOrThrow();
