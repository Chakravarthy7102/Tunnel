#!/usr/bin/env tsx

import { getOctokit } from '@-/octokit';
import { packageDirpaths } from '@-/packages-config';
import { getBumpedPackageVersion } from '@-/tunnel-public-packages-metadata/scripts';
import { z } from '@-/zod';
import { dayjs } from '@tunnel/dayjs';
import destr from 'destru';
import fs from 'node:fs';
import path from 'pathe';

const octokit = getOctokit();
dayjs.tz.setDefault('America/New_York');

const { commits } = (await octokit.createOrUpdateFiles({
	owner: 'Tunnel-Labs',
	repo: 'Tunnel',
	branch: 'main',
	changes: [
		{
			message: `Prepare new deployment @ ${
				dayjs
					.tz()
					.format('MMM D, YYYY h:mm A')
			} [skip ci]`,
			files: {
				...(await (async () => {
					// Get the bumped version of `@tunnel/cli-source`
					const bumpedPackageVersion = getBumpedPackageVersion({
						packageName: '@tunnel/cli-source',
					});

					const publicPackagesMetadataFilepath = path.join(
						packageDirpaths.tunnelPublicPackagesMetadata,
						'data/metadata.json',
					);

					const publicPackagesMetadata = z
						.record(z.string(), z.unknown())
						.parse(
							destr(
								await fs.promises.readFile(
									publicPackagesMetadataFilepath,
									'utf8',
								),
							),
						);
					return {
						[
							path.relative(
								packageDirpaths.monorepo,
								publicPackagesMetadataFilepath,
							)
						]: JSON.stringify(
							{
								...publicPackagesMetadata,
								'@tunnel/cli-source': {
									version: bumpedPackageVersion,
								},
							},
							null,
							'\t',
						) + '\n',
					};
				})()),
			},
		},
	],
})) as unknown as {
	commits: Awaited<ReturnType<typeof octokit.rest.git.createCommit>>['data'][];
};

if (commits[0] === undefined) {
	throw new Error('No commits were created');
}

// The `release` branch creates a staged production deployment (which can be instantly promoted to `tunnel.dev` when ready)
await octokit.rest.git.updateRef({
	owner: 'Tunnel-Labs',
	repo: 'Tunnel',
	ref: 'heads/release',
	sha: commits[0].sha,
	force: true,
});
