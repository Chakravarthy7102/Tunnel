/* eslint-disable @typescript-eslint/no-var-requires -- This file gets compiled into CommonJS */

import {
	acorn,
	escapeStringRegexp,
	nanoid,
	onetime,
	walk,
} from '#vendor/isomorphic.ts';
import type { ValueOf } from 'type-fest';
import { getArgumentString } from './argument.ts';
import { callExpression } from './call-expression.ts';
import { exprCallee, propertyCallee } from './callee.ts';
import {
	elementDomNodeToEventId,
	setElementDomNodeEventIdFromXpath,
} from './element.ts';
import { getEvalInstrumentedCode, originalEval, patchedEval } from './eval.ts';
import {
	createEvent,
	createGlobalInvokedEvent,
	functionEventsMap,
	getEvent,
} from './event.ts';
import {
	handleFunctionInvocation,
	overloadedFunctionReferenceToFunctionId,
	registerOverloadedFunction,
	tempFunctionEntry,
} from './function.ts';
import { idpState } from './idp.ts';
import { getInstrumentedCode } from './instrument.ts';
import { js } from './javascript.ts';
import getCurrentLocation from './location.ts';
import {
	getFirstParameterIdentifier,
	getNamedParameterPatternWithoutRight,
	getNamedParameterPatternWithRight,
	getParameterPatternWithoutRight,
	getParameterPatternWithRight,
	getParameterRight,
} from './parameter.ts';
import { jsxDEVFunctions } from './react.ts';
import { sourceToRenderEventIdMap } from './source.ts';
import { getTemporaryStorageFolderPath } from './storage.ts';
import { tnlProperties } from './tnl-aliases.ts';
import { newTrace } from './trace.ts';
import { getTransformedCodeFromAstNode } from './transform.ts';

export const TNL__ = createGlobalTnl();

function createGlobalTnl() {
	(globalThis as any).TNL__ ??= {};

	const tnl = {
		[tnlProperties.setElementDomNodeEventIdFromXpath]:
			setElementDomNodeEventIdFromXpath,
		[tnlProperties.elementDomNodeToEventId]: elementDomNodeToEventId,
		[tnlProperties.tempFunctionEntry]: tempFunctionEntry,
		[tnlProperties.getTemporaryStorageFolderPath]:
			getTemporaryStorageFolderPath,
		[tnlProperties.functionEventsMap]: functionEventsMap,
		[tnlProperties.sourceToRenderEventIdMap]: sourceToRenderEventIdMap,
		[tnlProperties.overloadedFunctionReferenceToFunctionId]:
			overloadedFunctionReferenceToFunctionId,
		[tnlProperties.jsxDEVFunctions]: jsxDEVFunctions,
		[tnlProperties.idpState]: idpState,
		[tnlProperties.getEvent]: getEvent,
		[tnlProperties.createGlobalInvokedEvent]: createGlobalInvokedEvent,
		[tnlProperties.registerOverloadedFunction]: registerOverloadedFunction,
		[tnlProperties.createEvent]: createEvent,
		[tnlProperties.newTrace]: newTrace,
		[tnlProperties.handleFunctionInvocation]: handleFunctionInvocation,
		[tnlProperties.propertyCallee]: propertyCallee,
		[tnlProperties.exprCallee]: exprCallee,
		[tnlProperties.callExpression]: callExpression,
		[tnlProperties.getEvalInstrumentedCode]: getEvalInstrumentedCode,
		[tnlProperties.originalEval]: originalEval,
		[tnlProperties.patchedEval]: patchedEval,
		[tnlProperties.acorn]: acorn,
		[tnlProperties.walk]: walk,
		[tnlProperties.onetime]: onetime,
		[tnlProperties.nanoid]: nanoid,
		[tnlProperties.getCurrentLocation]: getCurrentLocation,
		[tnlProperties.escapeStringRegexp]: escapeStringRegexp,
		[tnlProperties.js]: js,
		[tnlProperties.getInstrumentedCode]: getInstrumentedCode,
		[tnlProperties.getArgumentString]: getArgumentString,
		[tnlProperties.getTransformedCodeFromAstNode]:
			getTransformedCodeFromAstNode,
		[tnlProperties.getFirstParameterIdentifier]: getFirstParameterIdentifier,
		[tnlProperties.getNamedParameterPatternWithRight]:
			getNamedParameterPatternWithRight,
		[tnlProperties.getParameterPatternWithoutRight]:
			getParameterPatternWithoutRight,
		[tnlProperties.getNamedParameterPatternWithoutRight]:
			getNamedParameterPatternWithoutRight,
		[tnlProperties.getParameterRight]: getParameterRight,
		[tnlProperties.getParameterPatternWithRight]: getParameterPatternWithRight,
	} satisfies Record<ValueOf<typeof tnlProperties>, unknown>;

	Object.assign((globalThis as any).TNL__, tnl);

	return (globalThis as any).TNL__ as typeof tnl;
}
