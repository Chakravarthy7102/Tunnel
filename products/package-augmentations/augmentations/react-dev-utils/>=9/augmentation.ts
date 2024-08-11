import { definePackageAugmentation } from '#utils/define.ts';
import type { Replacement } from '@-/instrumentation';
import * as walk from 'acorn-walk';
import { outdent } from 'outdent';

export default definePackageAugmentation({
	'openBrowser.js': {
		instrumentation(context) {
			const replacements: Replacement[] = [];

			walk.simple(context.ast, {
				FunctionDeclaration(node: any) {
					if (node.id.name === 'openBrowser') {
						replacements.push({
							// Insert at the start of the function
							start: Number(node.body.start) + 1,
							end: Number(node.body.start) + 1,
							value: outdent`
								url = url.replace(/localhost:\\d+/, 'localhost:${context.localProjectEnvironment.localTunnelProxyServerPortNumber}')
							`,
						});
					}
				},
			});

			return replacements;
		},
	},
	'WebpackDevServerUtils.js': {
		instrumentation(context) {
			const replacements: Replacement[] = [];

			walk.simple(context.ast, {
				FunctionDeclaration(node: any) {
					if (node.id.name === 'choosePort') {
						replacements.push({
							start: Number(node.body.start) + 1,
							end: Number(node.body.start) + 1,
							value: outdent`
								return Promise.resolve(defaultPort);
							`,
						});
					}
				},
			});

			return replacements;
		},
	},
});
