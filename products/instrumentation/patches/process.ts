import type { LocalProjectEnvironment } from '@-/local-project';
import ansiRegex from 'ansi-regex';
import { flags, lookBehind, sequence, suffix } from 'compose-regexp';

const process_stdout_write = process.stdout.write.bind(process.stdout);
const process_stderr_write = process.stderr.write.bind(process.stderr);

export function patchNodeProcessMethods({
	localProjectEnvironment,
}: {
	localProjectEnvironment: LocalProjectEnvironment;
}) {
	const replaceData = (data: string) =>
		data.replaceAll(
			flags.add(
				'g',
				sequence(
					lookBehind(sequence(':', suffix('*', ansiRegex()))),
					localProjectEnvironment.localServicePortNumber.toString(),
				),
			),
			localProjectEnvironment.localTunnelProxyServerPortNumber.toString(),
		);

	process.stdout.write = (data) =>
		process_stdout_write(replaceData(data.toString()));
	process.stderr.write = (data) =>
		process_stderr_write(replaceData(data.toString()));
}
