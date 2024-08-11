import type { TransformationThis } from '#types';
import { js } from '#utils/javascript.ts';
import { tnlProperties } from '#utils/tnl-aliases.ts';
import { getTransformedCodeFromAstNode } from '#utils/transform.ts';
import * as walk from 'acorn-walk';

export function BlockStatement(
	this: TransformationThis,
	node: any,
	state: any,
) {
	const { replacements, context } = this;
	const functionDeclarationNames: string[] = [];

	for (const statement of node.body) {
		// Traverse the AST to find all the function declarations that will be hoisted in this scope
		walk.recursive(statement, state, {
			BlockStatement() {
				// Don't recurse on nested blocks
			},
			FunctionDeclaration(node: any) {
				functionDeclarationNames.push(node.id.name);
			},
		});
	}

	replacements.push({
		start: node.start,
		end: node.end,
		value: js`
			{
				${
			functionDeclarationNames.length > 0 ?
				js`
							[${functionDeclarationNames.join(',')}]
								.forEach(TNL__.${tnlProperties.registerOverloadedFunction});
						` :
				''
		}
				${
			node.body
				.map((statement: any) =>
					getTransformedCodeFromAstNode(statement, state, null, context)
				)
				.join(';')
		}
			}
		`,
	});
}
