#!/usr/bin/env tsx

import { getTunnelCliSingleExecutableApplicationBottles } from '#utils/bottle.ts';
import { getOctokit } from '@-/octokit';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { getTargets } from './utils/targets.ts';

const octokit = getOctokit();
const { version } =
	tunnelPublicPackagesMetadata['@tunnel/cli-single-executable-application'];
const targets = await getTargets();
const bottles = await getTunnelCliSingleExecutableApplicationBottles({
	targets,
	version,
});

// Use the GitHub API to dynamically upload the tar bottles
const { data: release } = await octokit.request(
	'POST /repos/{owner}/{repo}/releases',
	{
		owner: 'Tunnel-Labs',
		repo: 'homebrew-tunnel',
		tag_name: `v${version}`,
	},
);

await Promise.all(
	Object.entries(bottles).map(async ([target, bottle]) => {
		await octokit.request({
			method: 'POST',
			owner: 'Tunnel-Labs',
			repo: 'homebrew-tunnel',
			url: release.upload_url,
			release_id: release.id,
			name: `tunnel-cli-${version}.${target}.bottle.tar.gz`,
			data: bottle.tarball,
			headers: {
				'content-type': 'application/gzip',
				'content-length': bottle.tarball.length,
			},
		});
	}),
);
