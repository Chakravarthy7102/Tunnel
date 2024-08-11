import type { Replacement } from '@-/instrumentation';
import { tnlProperties } from '@-/instrumentation/tnl';
import type * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import { outdent } from 'outdent';

export function getJsxDevAugmentationReplacements({
	ast,
}: {
	ast: acorn.Node;
}): Replacement[] {
	const replacements: Replacement[] = [];

	walk.simple(ast, {
		Program(node) {
			replacements.push({
				start: Number(node.end),
				end: Number(node.end),
				value: outdent`
					if (globalThis.TNL__ !== undefined) {
						TNL__.${tnlProperties.jsxDEVFunctions}.add(exports.jsxDEV);
					}
				`,
			});
		},
		FunctionDeclaration(node: any) {
			if (node.id.name === 'jsxWithValidation') {
				replacements.push({
					start: Number(node.body.start) + 1,
					end: Number(node.body.start) + 1,
					value: outdent`
						if (globalThis.TNL__ !== undefined) {
							if (type !== Symbol.for('react.fragment')) {
								const renderEventId = globalThis.TNL__.${tnlProperties.sourceToRenderEventIdMap}.get(
									JSON.stringify(source)
								);

								if (renderEventId !== undefined) {
									props['data-__tnl-event-id'] = renderEventId;
								}
							}
						}
					`,
				});
			}
		},
	});

	return replacements;
}
