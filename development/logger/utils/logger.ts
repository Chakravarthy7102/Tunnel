/* eslint-disable no-console -- We only use console methods in the @-/logger package since that's what the log methods use under the hood */

import { APP_ENV } from '@-/env/app';
import { dayjs } from '@tunnel/dayjs';
import onetime from 'onetime';
import colors from 'picocolors';
import invariant from 'tiny-invariant';

type LogType = 'error' | 'debug' | 'info' | 'event' | 'warn';

// We use `picocolors` instead of chalk because Convex can't bundle `chalk` properly due to the global use of `navigator`
const logTypeToChalk = {
	debug: colors.gray,
	error: colors.red,
	warn: colors.yellow,
	event: colors.green,
	info: colors.blue,
};

// We do this lazily so other scripts (e.g. localdev) get a chance to patch the console methods
const getLogTypeToConsoleMethod = onetime(() =>
	typeof console === 'undefined' ?
		{} :
		({
			debug: console.log.bind(console),
			error: console.error.bind(console),
			warn: console.warn.bind(console),
			event: console.log.bind(console),
			info: console.info.bind(console),
		} satisfies Record<LogType, (message: unknown) => void>)
);

export function createLogger():
	& Record<LogType, (...messages: unknown[]) => void>
	& {
		write: typeof console.log;
	}
{
	function createLogMethod(type: LogType) {
		const logFunction = (...messages: unknown[]) => {
			const coloredPrefix = `${
				colors.dim(
					`[${dayjs().format()}]`,
				)
			} ${logTypeToChalk[type](type.padEnd(5))}`;

			const consoleMethod = getLogTypeToConsoleMethod()[type];
			invariant(
				consoleMethod !== undefined,
				'consoleMethod should not be undefined',
			);

			if (type === 'debug') {
				let areDebugLogsEnabled: boolean;

				// If running in Node.js, check for the `DEBUG` flag
				if (typeof window === 'undefined') {
					const debugFlagState: 'unset' | 'on' | 'off' =
						globalThis.process.env.DEBUG === undefined ?
							'unset' :
							globalThis.process.env.DEBUG === '1' ?
							'on' :
							'off';

					switch (debugFlagState) {
						case 'unset': {
							areDebugLogsEnabled = APP_ENV === 'development';
							break;
						}

						case 'on': {
							areDebugLogsEnabled = true;
							break;
						}

						case 'off': {
							areDebugLogsEnabled = false;
							break;
						}

						default: {
							areDebugLogsEnabled = false;
						}
					}
				} // If running in the browser, just check `release`
				else {
					areDebugLogsEnabled = APP_ENV === 'development';
				}

				if (!areDebugLogsEnabled) {
					return;
				}

				try {
					// @ts-expect-error -- Custom property
					globalThis.__tunnelLog = true;
					const result = consoleMethod(coloredPrefix, ...messages);
					return result;
				} finally {
					// @ts-expect-error -- Custom property
					globalThis.__tunnelLog = false;
				}
			} else {
				try {
					// @ts-expect-error -- Custom property
					globalThis.__tunnelLog = true;
					const result = consoleMethod(coloredPrefix, ...messages);
					return result;
				} finally {
					// @ts-expect-error -- Custom property
					globalThis.__tunnelLog = false;
				}
			}
		};

		return logFunction;
	}

	return {
		debug: createLogMethod('debug'),
		error: createLogMethod('error'),
		warn: createLogMethod('warn'),
		event: createLogMethod('event'),
		info: createLogMethod('info'),
		write(...args: any[]) {
			try {
				// @ts-expect-error -- Custom property
				globalThis.__tunnelLog = true;
				return console.log(...args);
			} finally {
				// @ts-expect-error -- Custom property
				globalThis.__tunnelLog = false;
			}
		},
	};
}
