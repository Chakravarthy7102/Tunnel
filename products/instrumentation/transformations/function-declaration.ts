import type { TransformationThis } from '#types';
import { js } from '#utils/javascript.ts';
import {
	getNamedParameterPatternWithoutRight,
	getParameterPatternWithRight,
} from '#utils/parameter.ts';
import { tnlProperties, tnlVariables } from '#utils/tnl-aliases.ts';
import { getTransformedCodeFromAstNode } from '#utils/transform.ts';

/**
	For a `FunctionDeclaration`, we retain the parameter structure (except with the defaults inlined inside the function itself and stubbed where necessary) so that the length of the function remains the same.

	We then move the original function body inside a nested IIFE and forward the parameters to it after initializing their default values if necessary and extracting the first parameter's value if a TNL__ arg was passed in. We forward the outer function's parameters using the `arguments` property because that is guaranteed to contain all the arguments that every JavaScript function can access.
*/
export function FunctionDeclaration(
	this: TransformationThis,
	node: any,
	state: any,
) {
	const { context, replacements } = this;

	let parentFunctionType;
	if (node.async) {
		if (node.generator) {
			parentFunctionType = 'asyncGenerator';
		} else {
			parentFunctionType = 'asyncFunction';
		}
	} else {
		if (node.generator) {
			parentFunctionType = 'generator';
		} else {
			parentFunctionType = 'function';
		}
	}

	const scopeName = node.id?.name ?? '<anonymous>';

	const parameterPatternsWithRight = node.params.map((param: any) =>
		getParameterPatternWithRight({ node: param, code: context.code })
	);

	if (node.params.length > 0) {
		const namedParameterPatternsWithRightStubbedString = node.params
			.map(
				(param: any, index: number) =>
					js`
						${
						getNamedParameterPatternWithoutRight({
							node: param,
							index,
							code: context.code,
						})
					}${param.right ? js` = undefined` : ''}
					`,
			)
			.join(',');
		replacements.push({
			start: node.params[0].start,
			end: node.params.at(-1).end,
			value: namedParameterPatternsWithRightStubbedString,
		});
	}

	// Prepend the destructuring of the first argument to the function body
	replacements.push({
		start: node.body.start,
		end: node.body.end,
		// dprint-ignore
		value: js`
			{
				let {
					${tnlVariables.TNL__firstArg},
					${tnlVariables.TNL__isMissingFirstParameter},
					${tnlVariables.TNL__currentFunctionScopeInvokedEventId}
				} = TNL__.${tnlProperties.handleFunctionInvocation}(
					${
						/* This needs to be `arguments` in order to retain the same value of `arguments.length` inside the function */ ''
					}
					arguments,
					() => TNL__.${tnlProperties.overloadedFunctionReferenceToFunctionId}.get(${
						node.id.name
					})
				);

				if (${tnlVariables.TNL__isMissingFirstParameter}) {
					arguments.length = 0
				}

				return (${node.async ? 'async ' : ''} function${node.generator ? '*' : ''}(
					${parameterPatternsWithRight.join(',')}
				) {
					${getTransformedCodeFromAstNode(
						node.body,
						{ ...state, parentFunctionType, scopeName },
						null,
						context
					)}
				}).apply(this, arguments)
			}
		`,
	});
}
