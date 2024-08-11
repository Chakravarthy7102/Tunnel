import type { TransformationThis } from '#types';
import { getArgumentString } from '#utils/argument.ts';
import { idpState } from '#utils/idp.ts';
import { js } from '#utils/javascript.ts';
import {
	getFirstParameterIdentifier,
	getNamedParameterPatternWithoutRight,
	getParameterPatternWithRight,
} from '#utils/parameter.ts';
import { tnlProperties } from '#utils/tnl-aliases.ts';
import { getTransformedCodeFromAstNode } from '#utils/transform.ts';

export function ArrowFunctionExpression(
	this: TransformationThis,
	node: any,
	state: any,
) {
	const { context, replacements } = this;

	let parentFunctionType;
	if (node.async) {
		parentFunctionType = 'asyncArrow';
	} else {
		parentFunctionType = 'arrow';
	}

	const scopeName = state?.scopeName ?? '<unknown>';

	const firstParameterIdentifier = getFirstParameterIdentifier({
		inArrowFunction: true,
		node: node.params[0],
	});
	const parameterPatternsWithRight = node.params.map((param: any) =>
		getParameterPatternWithRight({
			code: context.code,
			node: param,
		})
	);
	const argsString = node.params
		.map((param: any, index: number) =>
			getArgumentString({ node: param, index })
		)
		.join(',');

	const tempIndex = idpState.nextIdpId++;
	const instrumentedBody = getTransformedCodeFromAstNode(
		node.body,
		{
			...state,
			parameterPatternsWithRight,
			firstParameterIdentifier,
			argsString,
			async: node.async,
			parentFunctionType,
			scopeName,
			functionIdGetter: js`
				() => TNL__.${tnlProperties.tempFunctionEntry}[${tempIndex}].functionId
			`,
			isBodyExpression: node.body.type !== 'BlockStatement',
		},
		'_ArrowFunctionBody',
		context,
	);

	const namedParameterPatternsWithStubbedRightString =
		node.params.length === 0 ?
			'...TNL__args' :
			node.params
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
		start: node.start,
		end: node.end,
		value: js`
			(
				(
					TNL__.${tnlProperties.tempFunctionEntry}[${tempIndex}] = TNL__.${tnlProperties.registerOverloadedFunction}(
						(${namedParameterPatternsWithStubbedRightString}) => ${instrumentedBody}
					)
				),
				TNL__.${tnlProperties.tempFunctionEntry}[${tempIndex}].fn
			)
		`,
	});
}
