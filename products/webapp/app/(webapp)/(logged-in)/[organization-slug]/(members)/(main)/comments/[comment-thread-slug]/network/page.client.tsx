'use client';

import { useRouteContext } from '#utils/route-context.ts';
import { NetworkLogsTable } from '@-/comments';
import { Skeleton } from '@-/design-system/v1';
import { useFile } from '@-/file/react';
import type { NetworkLogEntry } from '@-/logs';
import { jsonl } from 'js-jsonl';
import { ChevronRightSquare } from 'lucide-react';

export default function ConsoleClientPage() {
	const { commentThread, commentsContext } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/comments/[comment-thread-slug]',
	);

	const networkLogEntriesFile = useFile(
		commentThread.networkLogEntriesFile,
		(text) => jsonl.parse<NetworkLogEntry>(text),
	);

	if (networkLogEntriesFile.isLoading) {
		return <Skeleton className="h-full w-full" />;
	}

	if (
		networkLogEntriesFile.parsedContents === null ||
		networkLogEntriesFile.parsedContents.length === 0
	) {
		return (
			<div className="p-20 w-full flex flex-col justify-center items-center gap-y-2">
				<ChevronRightSquare size={48} className="text-muted-foreground" />
				<p className="text-muted-foreground">
					Nothing to see here
				</p>
			</div>
		);
	}

	return (
		<NetworkLogsTable
			networkLogs={networkLogEntriesFile.parsedContents}
			commentsContext={commentsContext}
		/>
	);
}
