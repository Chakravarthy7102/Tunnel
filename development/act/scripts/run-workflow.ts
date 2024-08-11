#!/usr/bin/env tsx

import { bin } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import { cli } from 'cleye';
import { consola } from 'consola';
import fs from 'node:fs';
import path from 'pathe';

const argv = cli({
	parameters: ['<workflow name or path>'],
	flags: {
		job: {
			type: String,
			description: 'The name of the job to run',
		},
	},
});

const { workflowNameOrPath } = argv._;
let workflowFilename = path.basename(workflowNameOrPath);
if (!workflowFilename.endsWith('.yaml')) {
	workflowFilename += '.yaml';
}

const workflowsDirpath = path.join(
	packageDirpaths.monorepo,
	'.github/workflows',
);
const workflowFilepath = path.join(workflowsDirpath, workflowFilename);
if (!fs.existsSync(workflowFilepath)) {
	consola.error(`Workflow file not found: ${workflowFilepath}\n`);
	process.exit(1);
}

await bin.act(
	[
		'-j',
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- fix
		argv.flags.job!,
		'-W',
		workflowFilepath,
		'--container-architecture',
		'linux/amd64',
		'--secret-file',
		'.env',
	],
	{
		stdio: 'inherit',
		cwd: packageDirpaths.monorepo,
		env: {
			GITHUB_WORKSPACE: '/root/Tunnel-Labs/Tunnel',
		},
	},
);
