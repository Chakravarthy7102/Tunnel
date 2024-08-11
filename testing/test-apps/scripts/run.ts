#!/usr/bin/env tsx

import { runTestService } from '#utils/run.ts';
import { cli } from 'cleye';
import nullthrows from 'nullthrows-es';

const argv = cli({
	parameters: [
		'<repo>',
		'[service]',
	],
	flags: {
		config: {
			type: String,
			description: 'JSON-stringified config',
		},
	},
});

await runTestService({
	appRepo: argv._.repo,
	// eslint-disable-next-line no-restricted-properties -- We want to throw if it's invalid JSON
	servicesConfig: JSON.parse(nullthrows(argv.flags.config)),
	serviceSlug: argv._.service ?? null,
});
