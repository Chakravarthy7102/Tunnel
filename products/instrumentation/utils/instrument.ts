import type { LocalProjectEnvironment } from '@-/local-project';
import type { TunnelYamlConfig } from '@-/tunnel-yaml-config';
import * as acorn from 'acorn';
import { getTransformedCodeFromAstNode } from './transform.ts';

export function getInstrumentedCode({
	filepath,
	code,
	sourceType,
	inEval,
	localProjectEnvironment,
	tunnelYamlConfig,
	inlineTnl = false,
}: {
	filepath: string;
	code: string;
	sourceType: 'script' | 'module';
	inEval: boolean;
	localProjectEnvironment: LocalProjectEnvironment;
	tunnelYamlConfig: TunnelYamlConfig;
	inlineTnl?: { source: string } | false;
}) {
	// buggy
	return code;

	const acornOptions: acorn.Options = {
		ecmaVersion: 2022,
		sourceType,
		allowHashBang: true,
	};

	const ast = acorn.parse(code, acornOptions);

	const instrumentedCode = getTransformedCodeFromAstNode(ast, null, null, {
		filepath,
		code,
		inEval,
		inlineTnl,
		localProjectEnvironment,
		tunnelYamlConfig,
	});

	return instrumentedCode;
}
