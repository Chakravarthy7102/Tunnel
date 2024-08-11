#!/usr/bin/env tsx

/* eslint-disable no-await-in-loop -- needed to execute synchronously */

import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import { program } from 'commander';
import { destr } from 'destru';
import { $ } from 'execa';
import fs from 'node:fs';
import path from 'pathe';

await program.action(async () => {
	const convexJsonFilepath = path.join(
		packageDirpaths.database,
		'convex.json',
	);

	const convexJson = destr(
		await fs.promises.readFile(convexJsonFilepath, 'utf8'),
	);

	if (
		convexJson === null ||
		typeof convexJson !== 'object' ||
		!('version' in convexJson) ||
		typeof convexJson.version !== 'number'
	) {
		throw new TypeError('Invalid convex.json');
	}

	convexJson.version += 1;
	await fs.promises.writeFile(
		convexJsonFilepath,
		JSON.stringify(convexJson, null, '\t') + '\n',
	);

	const e = {
		stdio: 'inherit',
		cwd: packageDirpaths.monorepo,
	} as const;

	await $(e)`git config pull.rebase false`;
	await $(e)`git config --global user.name "github-actions"`;
	await $(
		e,
	)`git config --global user.email "41898282+github-actions[bot]@users.noreply.github.com"`;

	// We don't push to the `release` branch because that will be done by the "bump @tunnel/cli-source" workflow job
	for (let i = 0; i < 3; i += 1) {
		try {
			await $(e)`git add api/database/convex.json`;
			await $(e)`git commit -m ${'[skip ci] Bumped convex.json version'}`;
			await $(e)`git push --no-verify`;
			break;
		} catch {
			try {
				await $(e)`git pull --no-edit origin main`;
			} catch (error) {
				logger.error('Failed to pull:', error);
				process.exit(1);
			}
		}
	}
}).parseAsync();
