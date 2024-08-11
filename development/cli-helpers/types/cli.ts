import type {
	ExecaChildProcess,
	ExecaReturnValue,
	Options as ExecaOptions,
} from 'execa';
import type { EmptyObject, Promisable } from 'type-fest';

export interface CliTool<
	$ExtraOptions extends Record<string, unknown> = EmptyObject,
> {
	(
		command: string | string[],
		options?: ExecaOptions & $ExtraOptions,
	): Promise<ExecaReturnValue>;
	executableName: string;
	description: string;
	exists(): Promisable<boolean>;
	install(): Promisable<void>;
	getProcess(
		command: string | string[],
		options?: ExecaOptions & $ExtraOptions,
	): Promise<{ process: ExecaChildProcess }>;
}
