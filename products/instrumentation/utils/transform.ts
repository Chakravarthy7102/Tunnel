/* eslint-disable @typescript-eslint/restrict-template-expressions -- any */

import * as transformations from '#transformations/_.ts';
import type { TransformationContext } from '#types';
import * as walk from 'acorn-walk';
import mapObject from 'map-obj';

export function getTransformedCodeFromAstNode(
	instrumentedNode: any,
	instrumentedState: any,
	override: any,
	context: TransformationContext,
) {
	// Don't instrument anything if C2C is disabled
	if (!context.tunnelYamlConfig.experimental?.clickToCode) {
		return context.code;
	}

	const replacements: { start: number; end: number; value: string }[] = [];
	const transformationThis = { context, replacements };

	// TODO: Fix transformations with sourcemaps
	walk.recursive(
		instrumentedNode,
		instrumentedState,
		mapObject(transformations, (name, transformation) => [
			name,
			() => {
				if (name === 'Program') {
					transformation.bind(transformationThis);
				}
			},
		]),
		undefined,
		// @ts-expect-error: Internal
		override,
	);

	const newFunctionParts = [];
	let previousEnd = instrumentedNode.start;
	for (const replacement of replacements.sort((a, b) => a.start - b.start)) {
		newFunctionParts.push(
			context.code.slice(previousEnd, replacement.start),
			replacement.value,
		);
		previousEnd = replacement.end;
	}

	newFunctionParts.push(context.code.slice(previousEnd, instrumentedNode.end));

	const newFunctionContents = newFunctionParts.join('');

	return newFunctionContents;
}
