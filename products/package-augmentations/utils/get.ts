import augmentationExports from '#augmentations/_.ts';
import type { PackageAugmentation } from '#types';
import mapObject from 'map-obj';
import path from 'pathe';
import semver from 'semver';

export const packageAugmentations = mapObject(
	augmentationExports,
	(augmentationRelativeFilePath, augmentation) => [
		path.dirname(
			path.relative(
				'products/package-augmentations/augmentations',
				augmentationRelativeFilePath,
			),
		),
		augmentation.default,
	],
) as {
	[
		K in keyof typeof augmentationExports as K extends
			`products/package-augmentations/augmentations/${infer Id}/$augmentation.ts` ?
			Id :
			never
	]: (typeof augmentationExports)[K]['default'];
};

/**
	Can't be async because it gets called from a sync context
*/
export function getPackageAugmentation({
	packageName,
	packageVersion,
}: {
	packageName: string;
	packageVersion: string;
}): PackageAugmentation | null {
	// Find the first package augmentation that matches this package
	const augmentationIdToApply = Object.keys(packageAugmentations).find(
		(augmentationId) => {
			const lastSlash = augmentationId.lastIndexOf('/');
			const augmentationPackageName = augmentationId.slice(0, lastSlash);
			const semverRange = augmentationId.slice(lastSlash + 1);

			if (augmentationPackageName !== packageName) {
				return false;
			}

			return semver.satisfies(packageVersion, semverRange, {
				includePrerelease: true,
			});
		},
		// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- weird typescript-eslint bug
	) as keyof typeof packageAugmentations | undefined;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- weird typescript-eslint bug
	if (augmentationIdToApply !== undefined) {
		return packageAugmentations[augmentationIdToApply];
	}

	return null;
}
