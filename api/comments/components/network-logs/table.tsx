import type { CommentsContext } from '#types';
import type { NetworkLogEntry } from '@-/logs';
import path from 'pathe';
import safeUrl from 'safer-url';
import {
	columns,
	type NetworkLogDataTableEntry,
} from './columns.tsx';
import { DataTable } from './data-table.tsx';

export function NetworkLogsTable({
	networkLogs,
	commentsContext,
}: {
	networkLogs: NetworkLogEntry[];
	commentsContext: CommentsContext;
}) {
	const { container } = commentsContext.commentsState;
	const data = networkLogs.map((log) => transformLogsToTableFormat(log));
	return (
		<DataTable
			columns={columns}
			data={data}
			container={container}
		/>
	);
}

const transformLogsToTableFormat = (
	entry: NetworkLogEntry,
): NetworkLogDataTableEntry => {
	return {
		domain: safeUrl(entry.url)?.hostname ?? '',
		method: entry.method,
		name: path.basename(safeUrl(entry.url)?.pathname ?? ''),
		size: entry.transferSize ?? 0,
		status: entry.responseStatusCode ?? 0,
		time: entry.duration ?? 0,
		type: entry.initiatorType ?? '',
		requestBody: entry.requestBody ?? '',
		requestHeaders: entry.requestHeaders,
		responseBody: entry.responseBody ?? '',
		responseHeaders: entry.responseHeaders,
	};
};
