import type {
	PackageAugmentation,
	PackageAugmentationContext,
} from '#types';
import mapObject from 'map-obj';

const tunnelAugmentedComment = '/*tunnel:augmented*/';

export function definePackageAugmentation(
	packageAugmentation: PackageAugmentation,
): PackageAugmentation {
	return mapObject(packageAugmentation, (key, augmentationFunctions) => [
		key,
		mapObject(augmentationFunctions, (key, augmentationFunction) => [
			key,
			augmentationFunction === undefined ?
				undefined :
				(context: PackageAugmentationContext) => {
					// Whether or not the code has already been augmented
					if (context.originalCode.includes(tunnelAugmentedComment)) {
						return [];
					}

					const replacements = augmentationFunction(context);

					// Add a "marker" comment to the end of the file that marks
					// the file as already replaced (so we don't double-replace)

					replacements.push({
						start: context.ast.end,
						end: context.ast.end,
						value: '\n' + tunnelAugmentedComment + '\n',
					});

					return replacements;
				},
		]),
	]);
}
