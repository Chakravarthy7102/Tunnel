/* eslint-disable no-console -- We're patching the window's console.log */

import type { ConsoleLogEntry } from '@-/logs';
import { SuperJSON } from '@-/superjson';
import { getTunnelGlobals } from '@-/tunneled-service-globals';
import ConsoleParser from 'console-feed/lib/Hook/parse/index.js';

const methods = [
	'log',
	'debug',
	'info',
	'warn',
	'error',
	'table',
	'clear',
	'time',
	'timeEnd',
	'count',
	'assert',
	'command',
	'result',
	'dir',
];

export function patchConsoleMethods() {
	const tunnelGlobals = getTunnelGlobals();
	if (!tunnelGlobals) return;
	const { consoleLogsHistory } = tunnelGlobals;

	for (const methodName of methods) {
		// @ts-expect-error: Patching console methods
		const console_method = console[methodName];
		// @ts-expect-error: Patching console methods
		console[methodName] = function(...args: any[]) {
			// We ignore logs that are sent from our custom logger
			// @ts-expect-error: Custom property
			if (globalThis.__tunnelLog) {
				return console_method.apply(console, args);
			}

			const error = new Error('e');
			const stackLine = error.stack?.split('\n')[2]; // Get the third line of the stack trace
			const matchResult = stackLine?.match(/at\s+(.*)\s+\((.*):(\d*):(\d*)\)/);
			const fileName = matchResult && matchResult[2] ?
				matchResult[2] :
				'Unknown file';

			const timestamp = Date.now();

			// We use `setTimeout` to avoid blocking the main thread
			setTimeout(() => {
				const parsedLog = ConsoleParser.default(methodName as any, args);

				if (parsedLog) {
					const payload: ConsoleLogEntry = {
						id: parsedLog.id,
						type: parsedLog.method,
						payload: parsedLog.data?.map((d) => {
							try {
								return SuperJSON.stringify(d);
							} catch {
								return SuperJSON.stringify('[unserializable]');
							}
						}) ?? [],
						file: fileName,
						timestamp,
					};

					consoleLogsHistory.push(payload);
				}
			});

			return console_method.apply(console, args);
		};
	}
}
