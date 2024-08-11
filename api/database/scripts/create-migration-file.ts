#!/usr/bin/env tsx

import { packageDirpaths } from '@-/packages-config';
import chalk from 'chalk';
import enquirer from 'enquirer';
import { format } from 'fecha';
import fs from 'node:fs';
import { outdent } from 'outdent';
import path from 'pathe';

const { migrationTitle } = await enquirer.prompt<{ migrationTitle: string }>({
	name: 'migrationTitle',
	type: 'input',
	message: 'Enter the name of your migration:',
});
const migrationDateString = format(new Date(), 'YYYYMMDDHHmmss');
// Replace all non-alphanumeric characters with an underscore
const migrationName = `${migrationDateString}_${
	migrationTitle.replaceAll(
		/\W/g,
		'_',
	)
}`
	// Convex path components can only be a maximum of 64 characters long
	.slice(0, 64);

process.stdout.write(
	`Created migration file at ${chalk.green(migrationName)}/${
		chalk.cyan(
			'migration.ts',
		)
	}\n`,
);

const migrationDirpath = path.join(
	packageDirpaths.database,
	'convex/migrations',
	migrationName,
);
await fs.promises.mkdir(migrationDirpath, { recursive: true });
const migrationFilepath = path.join(migrationDirpath, 'migration.ts');

await fs.promises.writeFile(
	migrationFilepath,
	outdent`
		/* eslint-disable no-await-in-loop, @typescript-eslint/no-unnecessary-condition -- Migration */

		import { migration } from '#utils/migration.ts';

		export default migration(async (ctx, { cursor, numItems }) => {
			// Write your migration code here
		});
	`,
);
