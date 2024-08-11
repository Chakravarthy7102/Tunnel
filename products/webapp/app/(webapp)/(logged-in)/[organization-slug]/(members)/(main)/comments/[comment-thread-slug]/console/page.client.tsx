'use client';

import { useDocumentBody } from '#utils/document.ts';
import { useRouteContext } from '#utils/route-context.ts';
import { ConsoleLogs } from '@-/comments';
import { Skeleton } from '@-/design-system/v1';
import { useFile } from '@-/file/react';
import type { ConsoleLogEntry } from '@-/logs';
import { jsonl } from 'js-jsonl';

export default function ConsoleClientPage() {
	const { commentThread } = useRouteContext(
		'(webapp)/(logged-in)/[organization-slug]/(members)/(main)/comments/[comment-thread-slug]',
	);

	const consoleLogsFile = useFile(
		commentThread.consoleLogsFile,
		(fileContents) => jsonl.parse<ConsoleLogEntry>(fileContents),
	);

	if (consoleLogsFile.isLoading) {
		return <Skeleton className="h-full w-full" />;
	}

	const documentBody = useDocumentBody();

	return (
		<ConsoleLogs
			consoleLogs={consoleLogsFile.parsedContents ?? []}
			container={documentBody}
		/>
	);
}
