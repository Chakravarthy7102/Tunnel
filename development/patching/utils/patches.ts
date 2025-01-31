import patchExports from '#patches/_.ts';
import mapObject from 'map-obj';
import path from 'pathe';

export const patches = mapObject(
	patchExports,
	(patchRelativeFilePath, patch) => [
		path.dirname(
			path.relative('development/patching/patches', patchRelativeFilePath),
		),
		patch.default,
	],
) as {
	[
		K in keyof typeof patchExports as K extends
			`development/patching/patches/${infer Id}/_patch.ts` ? Id :
			never
	]: (typeof patchExports)[K]['default'];
};
