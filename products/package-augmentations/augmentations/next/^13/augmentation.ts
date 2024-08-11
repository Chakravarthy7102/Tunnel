import { getJsxDevAugmentationReplacements } from '#utils/augmentations/jsx-dev.ts';
import { getReactDomAugmentationReplacements } from '#utils/augmentations/react-dom.ts';
import { definePackageAugmentation } from '#utils/define.ts';
import type { Replacement } from '@-/instrumentation';
import * as walk from 'acorn-walk';

export default definePackageAugmentation({
	// jsxDEV
	'dist/compiled/react-experimental/cjs/react-jsx-dev-runtime.development.js': {
		instrumentation(context) {
			return getJsxDevAugmentationReplacements(context);
		},
	},
	'dist/compiled/react/cjs/react-jsx-dev-runtime.development.js': {
		instrumentation(context) {
			return getJsxDevAugmentationReplacements(context);
		},
	},
	// react-dom
	'dist/compiled/react-dom-experimental/cjs/react-dom.development.js': {
		instrumentation(context) {
			return getReactDomAugmentationReplacements(context);
		},
	},
	'dist/compiled/react-dom/cjs/react-dom.development.js': {
		instrumentation(context) {
			return getReactDomAugmentationReplacements(context);
		},
	},
	'dist/build/type-check.js': {
		deployment(context) {
			const replacements: Replacement[] = [];

			walk.simple(context.ast, {
				VariableDeclarator(node: any) {
					if (node.id.name === 'ignoreTypeScriptErrors') {
						replacements.push({
							start: node.init.start,
							end: node.init.end,
							value: 'true',
						});
					}
				},
			});

			return replacements;
		},
	},
	'dist/build/index.js': {
		deployment(context) {
			const replacements: Replacement[] = [];

			walk.simple(context.ast, {
				VariableDeclarator(node: any) {
					if (node.id.name === 'shouldLint') {
						replacements.push({
							start: node.init.start,
							end: node.init.end,
							value: 'false',
						});
					}
				},
			});

			return replacements;
		},
	},
});
