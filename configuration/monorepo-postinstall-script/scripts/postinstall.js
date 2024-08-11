#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

if (!fs.existsSync(path.join(dirname, '../node_modules'))) {
	process.stdout.write('Missing `node_modules`; skipping postinstall script\n');
	process.exit(0);
}

const tunBinFilepath = path.join(dirname, '../../../node_modules/.bin/tsx');
if (!fs.existsSync(tunBinFilepath)) {
	process.stdout.write('Missing `tsx`; skipping postinstall script\n');
	process.exit(0);
}

const postinstallScriptTsPath = path.join(
	dirname,
	'../spawn/postinstall.ts',
);

const { status } = spawnSync(tunBinFilepath, [postinstallScriptTsPath], {
	stdio: 'inherit',
	cwd: path.join(dirname, '..'),
});
process.exit(status);
