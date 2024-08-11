import { packageDirpaths } from '@-/packages-config';
import type { Release } from '@tunnel/release';
import fs from 'node:fs';
import { brotliCompress, gzip } from 'node:zlib';
import path from 'pathe';
import pify from 'pify';
import postcss from 'postcss';
// @ts-expect-error: no types
import postcssLightningcss from 'postcss-lightningcss';

export async function buildTunnelInstancePageToolbarGlobalCss({
	release,
	compressResources,
}: {
	release: Release;
	compressResources: boolean;
}) {
	const toolbarGlobalCssFilepath = path.join(
		packageDirpaths.tunnelInstancePageToolbar,
		'entry/toolbar.global.css',
	);

	const css = fs.readFileSync(toolbarGlobalCssFilepath, 'utf8');

	const postcssPlugins = [];
	if (release !== null) {
		postcssPlugins.push(postcssLightningcss());
	}

	const result = await postcss(postcssPlugins).process(css, {
		to: path.join(
			packageDirpaths.tunnelInstancePageToolbar,
			'.build/toolbar.global.css',
		),
	});

	await fs.promises.writeFile(
		path.join(
			packageDirpaths.tunnelInstancePageToolbar,
			'.build/toolbar.global.css',
		),
		result.css,
	);

	if (compressResources) {
		await Promise.all([
			(async () => {
				await fs.promises.writeFile(
					path.join(
						packageDirpaths.tunnelInstancePageToolbar,
						'.build/toolbar.global.css.br',
					),
					await pify(brotliCompress)(result.css),
				);
			})(),
			(async () => {
				await fs.promises.writeFile(
					path.join(
						packageDirpaths.tunnelInstancePageToolbar,
						'.build/toolbar.global.css.gz',
					),
					await (pify(gzip) as any)(result.css),
				);
			})(),
		]);
	}
}
