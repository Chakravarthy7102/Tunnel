import type { TransformationThis } from '#types';
import { js } from '#utils/javascript.ts';
import { tnlProperties } from '#utils/tnl-aliases.ts';
import { getTransformedCodeFromAstNode } from '#utils/transform.ts';
import * as walk from 'acorn-walk';
import path from 'pathe';

export function Program(this: TransformationThis, node: any, state: any) {
	const { context, replacements } = this;

	let codeStart = node.body[0]?.start;
	if (codeStart === undefined) {
		return;
	}

	if (node.body[0].directive) {
		codeStart = node.body[1]?.start;
	}

	// Skip instrumenting the code if it has already been instrumented
	if (
		node.body.some(
			(statement: any) =>
				statement.type === 'FunctionDeclaration' &&
				statement.id.name === 'TNL__global',
		)
	) {
		return;
	}

	const functionDeclarationNames: string[] = [];

	// Traverse the AST to find all the function declarations that will be hoisted in this scope
	walk.recursive(node, state, {
		BlockStatement() {
			// Don't recurse on nested blocks
		},
		FunctionDeclaration(node: any) {
			functionDeclarationNames.push(node.id.name);
		},
	});

	if (context.inEval) {
		if (functionDeclarationNames.length > 0) {
			replacements.push({
				start: codeStart,
				end: codeStart,
				value: js`
					[${functionDeclarationNames.join(',')}]
						.forEach(TNL__.${tnlProperties.registerOverloadedFunction});
				`,
			});
		}

		for (const statement of node.body) {
			replacements.push({
				start: statement.start,
				end: statement.end,
				value: getTransformedCodeFromAstNode(
					statement,
					{ ...state, scopeName: '<eval>' },
					null,
					context,
				),
			});
		}
	} else {
		replacements.push({
			start: codeStart,
			end: node.end,
			/** We use `let` for better minification */
			// dprint-ignore
			value: js`
				if (globalThis.TNL__ === undefined) {
					if (typeof(window) === 'undefined') {
						${
							context.inlineTnl
								? context.inlineTnl.source
								: `require(${
										JSON.stringify(
											path.join(
												context.localProjectEnvironment.tunnelCliSourceDirpath, 'instrumentation/tnl.js'
											)
										)
									})`
						};
					} else {
						throw${' '}new${' '}Error('globalThis.TNL__${' '}should${' '}be${' '}loaded');
					}
				}

				globalThis.TNL__.localProjectEnvironment = ${JSON.stringify(context.localProjectEnvironment)};
				globalThis.TNL__.tunnelYamlConfig = ${JSON.stringify(context.tunnelYamlConfig)};
			`,
			// value: js`
			// 	if (globalThis.TNL__ === undefined) {
			// 		if (typeof(window) === 'undefined') {
			// 			${
			// 				context.inlineTnl
			// 					? context.inlineTnl.source
			// 					: `require(${
			// 							JSON.stringify(
			// 								path.join(
			// 									context.localProjectEnvironment.tunnelCliSourceDirpath, 'instrumentation/tnl.js'
			// 								)
			// 							)
			// 						})`
			// 			};
			// 		} else {
			// 			throw${' '}new${' '}Error('globalThis.TNL__${' '}should${' '}be${' '}loaded');
			// 		}
			// 	}

			// 	globalThis.TNL__.localProjectEnvironment = ${JSON.stringify(context.localProjectEnvironment)};

			// 	if (typeof(window) === 'undefined' && globalThis.TNL__instrumentationApiServer === undefined) {
			// 		let${' '}instrumentationApi;
			// 		try {
			// 			instrumentationApi = require(${
			// 				JSON.stringify(
			// 					path.join(
			// 						context.localProjectEnvironment.tunnelCliSourceDirpath,
			// 						'instrumentation/api.js'
			// 					)
			// 				)
			// 			});
			// 		} catch (_) {}
			// 		if (instrumentationApi !== undefined) {
			// 			globalThis.TNL__instrumentationApiServer = instrumentationApi.startInstrumentationApiServer({
			// 				localProjectEnvironment: globalThis.TNL__.localProjectEnvironment,
			// 				release: ${JSON.stringify(context.localProjectEnvironment.release)} ?? 'production',
			// 			});
			// 		}
			// 	}

			// 	if (typeof(window) !== 'undefined') {
			// 		const { setAttribute, setAttributeNS } = window.HTMLElement.prototype;
			// 		window.HTMLElement.prototype.setAttribute = function (name, value) {
			// 			if (name === 'data-__tnl-event-id') {
			// 				TNL__.${tnlProperties.elementDomNodeToEventId}.set(this, value);
			// 			} else {
			// 				setAttribute.call(this, name, value);
			// 			}
			// 		};
			// 		window.HTMLElement.prototype.setAttributeNS = function (name, value) {
			// 			if (name === 'data-__tnl-event-id') {
			// 				TNL__.${tnlProperties.elementDomNodeToEventId}.set(this, value);
			// 			} else {
			// 				setAttributeNS.call(this, name, value);
			// 			}
			// 		};
			// 	}

			// 	${/* A stub function that represents the global scope */ ''}
			// 	function${' '}TNL__global() {}

			// 	var${' '}${
			// 		tnlVariables.TNL__currentFunctionScopeInvokedEventId
			// 	} = ${JSON.stringify(nanoid())};

			// 	globalThis.${tnlVariables.TNL__functionInvokedEvents} ??= Object.create(null);
			// 	globalThis.${tnlVariables.TNL__functionInvokedEvents}[
			// 		${tnlVariables.TNL__currentFunctionScopeInvokedEventId}
			// 	] = TNL__.${tnlProperties.createGlobalInvokedEvent}(
			// 		TNL__.${tnlProperties.registerOverloadedFunction}(TNL__global).functionId
			// 	);

			// 	${
			// 		functionDeclarationNames.length > 0
			// 			? js`
			// 				[${functionDeclarationNames.join(',')}]
			// 					.forEach(TNL__.${tnlProperties.registerOverloadedFunction});
			// 			`
			// 			: ''
			// 	}
			// 	${node.body
			// 		.map((statement: any) =>
			// 			getTransformedCodeFromAstNode(
			// 				statement,
			// 				{ ...state, scopeName: '__global' },
			// 				null,
			// 				context
			// 			)
			// 		)
			// 		.join(';')};
			// `
		});
	}
}
