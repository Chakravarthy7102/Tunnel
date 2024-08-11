#!/usr/bin/env tsx

import { generateBasehub } from '#utils/basehub.ts';
import { createDirenvTomlFile } from '#utils/direnv.ts';
import {
	generateInfisicalDotenvFile,
	generateInfisicalVariablesDataFile,
} from '#utils/infisical.ts';
import { lefthookInstall } from '#utils/lefthook.ts';
import { updateZshrcFile } from '#utils/zshrc.ts';
import { cli } from '@-/cli-helpers';
import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import { pkgxDevelopmentDependencies } from '@-/pkgx';
import { execa } from 'execa';
import isCi from 'is-ci';

if (process.env.SKIP_TUNNEL_POSTINSTALL) {
	process.exit(0);
}

if (isCi) {
	process.exit(0);
}

const pkgxSpecifiers = Object.entries(pkgxDevelopmentDependencies).map(
	([specifier, version]) => `+${specifier}=${version}`,
);
logger.info(`Running "pkgx ${pkgxSpecifiers.join(' ')}"...`);
await execa('pkgx', pkgxSpecifiers, {
	stdio: 'inherit',
	cwd: packageDirpaths.monorepo,
});

if (!(await cli.pkgx.exists())) {
	logger.info('Installing pkgx CLI...');
	await cli.pkgx.install();
	logger.info('pkgx CLI installed!');
}

if (!(await cli.pnpm.exists())) {
	logger.info('Installing pnpm...');
	await cli.pnpm.install();
	logger.info('pnpm installed!');
}

// We need to generate .env files first since the other postinstall scripts might depend on them
await Promise.allSettled([
	generateInfisicalDotenvFile(),
	generateInfisicalVariablesDataFile(),
]);

await Promise.allSettled([
	lefthookInstall(),
	createDirenvTomlFile(),
	updateZshrcFile(),
	generateBasehub(),
]);
