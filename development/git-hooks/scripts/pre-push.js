#!/usr/bin/env node

// @ts-check

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
// eslint-disable-next-line no-restricted-imports -- The package's dependencies might not have been installed
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

if (!fs.existsSync(path.join(dirname, '../../../node_modules/.bin/tsx'))) {
	process.stderr.write('Missing `tsx`; skipping postmerge script\n');
	process.exit(0);
}

const prePushScriptTsPath = path.join(dirname, '../spawn/pre-push.ts');

const { status } = spawnSync(prePushScriptTsPath, { stdio: 'inherit' });
process.exit(status ?? 0);
