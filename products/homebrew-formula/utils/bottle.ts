import type { HomebrewBottle } from '#types';
import { getTunnelCliSingleExecutableApplicationFormula } from '#utils/formula.ts';
import { getOctokit } from '@-/octokit';
import { getStreamAsBuffer } from 'get-stream';
import { hash } from 'hasha';
import intoStream from 'into-stream';
import fs from 'node:fs';
import path from 'pathe';
import tar from 'tar';
import { temporaryDirectory } from 'tempy';

/**
	In order to prevent homebrew from trying to install the package from source (since we already provide it as an executable), we need to create homebrew bottles in advance. However, since we already have the executable, we can generate the bottles ourselves without having to build the bottles in various CI/CD environments.
*/
export async function getTunnelCliSingleExecutableApplicationBottles({
	version,
	targets,
}: {
	version: string;
	targets: {
		'darwin-arm64': {
			sha256Hash: string;
			tunnelBinFilepath: string;
		};
		'darwin-x64': {
			sha256Hash: string;
			tunnelBinFilepath: string;
		};
		'linux-x64': {
			sha256Hash: string;
			tunnelBinFilepath: string;
		};
		'linux-arm64': {
			sha256Hash: string;
			tunnelBinFilepath: string;
		};
	};
}): Promise<Record<string, HomebrewBottle>> {
	const tunnelCliSingleExecutableApplicationFormulaFileContentsWithoutBottles =
		getTunnelCliSingleExecutableApplicationFormula({
			version,
			targets,
			bottles: null,
		});

	const armMacosBottle = await getBottleMetadata({
		target: targets['darwin-arm64'],
		version,
		tunnelCliSingleExecutableApplicationFormulaFileContentsWithoutBottles,
	});

	const x64MacosBottle = await getBottleMetadata({
		target: targets['darwin-x64'],
		version,
		tunnelCliSingleExecutableApplicationFormulaFileContentsWithoutBottles,
	});

	const x64LinuxBottle = await getBottleMetadata({
		target: targets['linux-x64'],
		version,
		tunnelCliSingleExecutableApplicationFormulaFileContentsWithoutBottles,
	});

	return {
		arm64_ventura: armMacosBottle,
		arm64_monterey: armMacosBottle,
		arm64_big_sur: armMacosBottle,
		ventura: x64MacosBottle,
		monterey: x64MacosBottle,
		big_sur: x64MacosBottle,
		catalina: armMacosBottle,
		mojave: armMacosBottle,
		high_sierra: armMacosBottle,
		sierra: armMacosBottle,
		el_capitan: armMacosBottle,
		x86_64_linux: x64LinuxBottle,
	};
}

async function getBottleMetadata({
	target,
	version,
	tunnelCliSingleExecutableApplicationFormulaFileContentsWithoutBottles,
}: {
	target: {
		sha256Hash: string;
		tunnelBinFilepath: string;
	};
	version: string;
	tunnelCliSingleExecutableApplicationFormulaFileContentsWithoutBottles: string;
}): Promise<HomebrewBottle> {
	const temporaryDirpath = temporaryDirectory();

	const dotBrewDirpath = path.join(temporaryDirpath, 'tunnel-cli/.brew');
	await fs.promises.mkdir(dotBrewDirpath, { recursive: true });
	await fs.promises.writeFile(
		path.join(dotBrewDirpath, 'tunnel-cli.rb'),
		tunnelCliSingleExecutableApplicationFormulaFileContentsWithoutBottles,
	);

	await fs.promises.mkdir(
		path.join(temporaryDirpath, `tunnel-cli/${version}/bin`),
		{ recursive: true },
	);
	await fs.promises.cp(
		target.tunnelBinFilepath,
		path.join(temporaryDirpath, `tunnel-cli/${version}/bin/tunnel`),
	);

	const tarball = await getStreamAsBuffer(
		tar.create({ gzip: true, cwd: temporaryDirpath }, ['tunnel-cli']),
	);

	const sha256Hash = await hash(intoStream(tarball), {
		algorithm: 'sha256',
	});

	return { sha256Hash, tarball };
}

export async function uploadBottlesToGithubReleases({
	version,
	bottles,
}: {
	version: string;
	bottles: Record<string, HomebrewBottle>;
}) {
	const octokit = getOctokit();

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
}
