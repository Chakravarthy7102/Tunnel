import type { PackageAugmentationContext } from '#types';
import type { Replacement } from '@-/instrumentation';
import * as walk from 'acorn-walk';
import { outdent } from 'outdent';

export function getReactDomAugmentationReplacements({
	ast,
}: PackageAugmentationContext): Replacement[] {
	const replacements: Replacement[] = [];

	walk.simple(ast, {
		AssignmentExpression(node: any) {
			if (
				node.left.name === 'warnForPropDifference' &&
				node.right.type === 'FunctionExpression'
			) {
				replacements.push({
					// Insert at the start of the function
					start: Number(node.right.body.start) + 1,
					end: Number(node.right.body.start) + 1,
					value: outdent`
						if (globalThis.TNL__ !== undefined) {
							if (propName === 'data-__tnl-event-id') {
								return;
							}

							if (
								propName === 'dangerouslySetInnerHTML' &&
								serverValue.startsWith('if(globalThis.TNL__===undefined)')
							) {
								return;
							}
						}
					`,
				});
			}
		},
	});

	return replacements;
}
