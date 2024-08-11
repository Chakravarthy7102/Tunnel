import { getJsxDevAugmentationReplacements } from '#utils/augmentations/jsx-dev.ts';
import { definePackageAugmentation } from '#utils/define.ts';

export default definePackageAugmentation({
	'cjs/react-jsx-dev-runtime.development.js': {
		instrumentation(context) {
			return getJsxDevAugmentationReplacements(context);
		},
	},
});
