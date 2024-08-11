#!/usr/bin/env tsx

import { packageDirpaths } from '@-/packages-config';
import { z } from '@-/zod';
import destr from 'destru';
import fs from 'node:fs';
import path from 'pathe';
import semver from 'semver';

export function getBumpedPackageVersion({
	packageName,
	write,
}: {
	packageName: string;
	write?: boolean;
}) {
	const packagesMetadataFilepath = path.join(
		packageDirpaths.tunnelPublicPackagesMetadata,
		'data/metadata.json',
	);

	const packagesMetadataJson = fs.readFileSync(
		packagesMetadataFilepath,
		'utf8',
	);

	const packagesMetadata = z
		.record(
			z.string(),
			z.object({ version: z.string(), supportedTargets: z.optional(z.any()) }),
		)
		.parse(destr(packagesMetadataJson));

	const packageMetadata = packagesMetadata[packageName];
	if (packageMetadata === undefined) {
		throw new Error(`Package ${packageName} not found in packages metadata`);
	}

	const semverParseResult = semver.parse(packageMetadata.version);
	if (semverParseResult === null) {
		throw new Error(`Invalid version: ${packageMetadata.version}`);
	}

	let { major, minor, patch } = semverParseResult;
	patch += 1;
	const newVersion = `${major}.${minor}.${patch}`;

	if (write) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO
		packagesMetadata[packageName]!.version = newVersion;
		fs.writeFileSync(
			packagesMetadataFilepath,
			JSON.stringify(packagesMetadata, null, '\t'),
			'utf8',
		);
	}

	return newVersion;
}
