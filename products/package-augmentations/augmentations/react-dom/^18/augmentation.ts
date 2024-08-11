import { getReactDomAugmentationReplacements } from '#utils/augmentations/react-dom.ts';
import { definePackageAugmentation } from '#utils/define.ts';

export default definePackageAugmentation({
	'cjs/react-dom.development.js': {
		instrumentation(context) {
			return getReactDomAugmentationReplacements(context);
		},
	},
});
