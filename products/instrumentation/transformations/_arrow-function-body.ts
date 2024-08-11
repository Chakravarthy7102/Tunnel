import type { TransformationThis } from '#types';
import { js } from '#utils/javascript.ts';
import { tnlProperties, tnlVariables } from '#utils/tnl-aliases.ts';
import { getTransformedCodeFromAstNode } from '#utils/transform.ts';

export function _ArrowFunctionBody(
	this: TransformationThis,
	node: any,
	state: any,
) {
	const { context, replacements } = this;
	const {
		firstParameterIdentifier,
		parameterPatternsWithRight,
		argsString,
		async,
		isBodyExpression,
		functionIdGetter,
	} = state;

	const instrumentedBody = getTransformedCodeFromAstNode(
		node,
		state,
		null,
		context,
	);

	replacements.push({
		start: node.start,
		end: node.end,
		value: js`
			{
				let${' '}${tnlVariables.TNL__args} = [${argsString}];
				let {
					${tnlVariables.TNL__firstArg},
					${tnlVariables.TNL__isMissingFirstParameter},
					${tnlVariables.TNL__currentFunctionScopeInvokedEventId}
				} = TNL__.${tnlProperties.handleFunctionInvocation}(
					${tnlVariables.TNL__args},
					${functionIdGetter}
				);
				${firstParameterIdentifier} = ${tnlVariables.TNL__firstArg};
				return (${async ? 'async' : ''} (${parameterPatternsWithRight}) => {
					${isBodyExpression ? 'return ' : ''} ${instrumentedBody}
				})(
					...(
						${tnlVariables.TNL__isMissingFirstParameter}
							? []
							: ${tnlVariables.TNL__args}
					)
				)
			}
		`,
	});
}
