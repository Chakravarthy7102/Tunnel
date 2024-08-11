#!/usr/bin/env tsx

import { getTunnelCliSingleExecutableApplicationBottles } from '#utils/bottle.ts';
import { getTunnelCliSingleExecutableApplicationFormula } from '#utils/formula.ts';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { getTargets } from './utils/targets.ts';

const { version } =
	tunnelPublicPackagesMetadata['@tunnel/cli-single-executable-application'];

const targets = await getTargets();

const bottles = await getTunnelCliSingleExecutableApplicationBottles({
	targets,
	version,
});

process.stdout.write(
	getTunnelCliSingleExecutableApplicationFormula({
		version,
		targets,
		bottles,
	}) + '\n',
);
