import type { Replacement } from '@-/instrumentation';
import type { LocalProjectEnvironment } from '@-/local-project';
import type * as acorn from 'acorn';

export interface PackageAugmentationContext {
	ast: acorn.Node;
	originalCode: string;
	localProjectEnvironment: LocalProjectEnvironment;
}

/**
	Has to be sync because it might be called from a sync context (e.g. `fs.readFileSync`)
*/
type PackageAugmentationFunction = (
	context: PackageAugmentationContext,
) => Replacement[];

interface PackageAugmentationEntry {
	instrumentation?: PackageAugmentationFunction;
	deployment?: PackageAugmentationFunction;
}

export type PackageAugmentation = Record<string, PackageAugmentationEntry>;
