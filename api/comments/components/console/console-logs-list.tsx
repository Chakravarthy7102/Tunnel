import type { ConsoleLogEntry } from '@-/logs';
import { SuperJSON } from '@-/superjson';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/core';
import { dayjs } from '@tunnel/dayjs';
import { Console } from 'console-feed';
import memoize from 'memoize';

const getCache = memoize((container: HTMLElement | null) => {
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- broken types
	return (createCache.default ?? createCache)({
		key: 'console',
		container: container ?? undefined,
	});
});

export function ConsoleLogsList({ logs, container }: {
	logs: ConsoleLogEntry[];
	container: HTMLElement | null;
}) {
	const cache = getCache(container);

	return (
		<CacheProvider value={cache}>
			<div className="overflow-auto w-full h-full mb-5">
				<Console
					logs={logs.map((log) => ({
						id: log.id,
						method: log.type as any ?? 'log',
						data: log.payload.map(SuperJSON.parse),
						timestamp: dayjs(log.timestamp).format('hh:mm:ss.SSS'),
					}))}
					variant="dark"
				/>
			</div>
		</CacheProvider>
	);
}
