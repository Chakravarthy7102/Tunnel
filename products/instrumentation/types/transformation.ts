import type { LocalProjectEnvironment } from '@-/local-project';
import type { TunnelYamlConfig } from '@-/tunnel-yaml-config';

export interface TransformationContext {
	filepath: string;
	code: string;
	inEval: boolean;
	inlineTnl: { source: string } | false;
	localProjectEnvironment: LocalProjectEnvironment;
	tunnelYamlConfig: TunnelYamlConfig;
}

export interface TransformationThis {
	context: TransformationContext;
	replacements: { start: number; end: number; value: string }[];
}
