import type { TransformationThis } from '#types';
import { js } from '#utils/javascript.ts';
import { tnlProperties, tnlVariables } from '#utils/tnl-aliases.ts';
import { getTransformedCodeFromAstNode } from '#utils/transform.ts';

export function CallExpression(
	this: TransformationThis,
	node: any,
	state: any,
) {
	const { context, replacements } = this;
	const parentFunctionType = state?.parentFunctionType ?? 'arrow';

	const isEvalCall = node.callee.type === 'Identifier' &&
		node.callee.name === 'eval';
	const scopeName = state?.scopeName ?? (isEvalCall ? '<eval>' : '<unknown>');

	const instrumentedCallee = getTransformedCodeFromAstNode(
		node.callee,
		{ ...state, parentFunctionType, scopeName },
		'_Callee',
		context,
	);

	replacements.push({
		start: node.start,
		end: node.end,
		// Since calling the `callExpression` function is a call expression itself, the precedence of this expression won't change.
		value: ' ' +
			js`
				TNL__.${tnlProperties.callExpression}(
					(${
				isEvalCall ?
					// Can't use a wrapper function for eval since it needs to be evaluated in the same scope
					js`
								(
									c => eval(
										TNL__.${tnlProperties.getEvalInstrumentedCode}(
											c,
											${JSON.stringify(context.filepath)}
										)
									)
								)
							` :
					instrumentedCallee
			}),
					[
						${
				node.arguments
					.map((argument: any) =>
						getTransformedCodeFromAstNode(
							argument,
							state,
							'_CallExpressionArgument',
							context,
						)
					)
					.join(',')
			}
					],
					${tnlVariables.TNL__currentFunctionScopeInvokedEventId}
				)
			`,
	});
}
