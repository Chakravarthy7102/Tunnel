import type { PageToolbarContext } from '#types';
import { useCommentsContext } from '#utils/comment.ts';
import { useContextStore } from '#utils/context/_.ts';
import { type ClientDoc, select } from '@-/client-doc';
import {
	Comment,
	ConsoleLogs,
	FirstComment,
	IntegrationActivity,
	MetadataCard,
	NetworkLogsTable,
	ThreadReplyInput,
} from '@-/comments';
import { useFullEditor } from '@-/comments/tiptap';
import {
	clientId,
} from '@-/database';
import type { ProjectCommentThread_$tunnelInstancePageToolbarData } from '@-/database/selections';
import {
	Skeleton,
} from '@-/design-system/v1';
import { useFile } from '@-/file/react';
import type {
	ConsoleLogEntry,
	NetworkLogEntry,
} from '@-/logs';
import { UserAvatar } from '@-/user/components';
import { jsonl } from 'js-jsonl';
import { ChevronRightSquare } from 'lucide-react';
import { useState } from 'react';

export function FullComment({
	context,
	commentThread,
}: {
	context: PageToolbarContext<{
		isOnline: true;
		actorType: 'User';
		hasProject: true;
	}>;
	commentThread: ClientDoc<
		typeof ProjectCommentThread_$tunnelInstancePageToolbarData
	>;
}) {
	const [page, setPage] = useState<'feed' | 'console' | 'network' | 'metadata'>(
		'feed',
	);

	const firstComment = commentThread.comments[0];
	const commentsContext = useCommentsContext({ context });

	if (firstComment === undefined) {
		return null;
	}

	return (
		<div className="w-full flex flex-col justify-start items-center text-foreground gap-8 h-full">
			<FirstComment
				commentsContext={commentsContext}
				comment={firstComment}
				commentThread={commentThread}
				activeSection={page}
				setActiveSection={setPage}
			/>
			<div className="w-full flex flex-col justify-start items-center gap-8 h-full">
				{page === 'feed' && (
					<FeedPage context={context} commentThread={commentThread} />
				)}
				{page === 'console' && (
					<ConsolePage
						context={context}
						consoleLogsFile={commentThread.consoleLogsFile}
					/>
				)}
				{page === 'network' && (
					<NetworkPage
						context={context}
						networkLogEntriesFile={commentThread.networkLogEntriesFile}
					/>
				)}
				{page === 'metadata' && (
					<MetadataPage
						context={context}
						commentThread={commentThread}
					/>
				)}
			</div>
		</div>
	);
}

function FeedPage({
	context,
	commentThread,
}: {
	commentThread: ClientDoc<
		typeof ProjectCommentThread_$tunnelInstancePageToolbarData
	>;
	context: PageToolbarContext<{
		isOnline: true;
		actorType: 'User';
		hasProject: true;
	}>;
}) {
	const state = useContextStore(context);

	const commentsContext = useCommentsContext({ context });

	const actorUser = select(
		state,
		'User',
		state.actor.data.id,
	);
	const editor = useFullEditor({
		commentsContext,
		organization: commentThread.organization,
	});

	return (
		<>
			<div className="w-full flex flex-col justify-center items-center max-w-3xl gap-y-5">
				<IntegrationActivity
					commentThread={commentThread}
				/>
				{commentThread.comments.length > 1 && (
					<>
						{commentThread
							.comments
							.slice(1)
							.sort((comment1, comment2) => {
								return comment1._creationTime - comment2._creationTime;
							})
							.map((comment) => (
								<Comment
									key={clientId(comment._id)}
									commentsContext={commentsContext}
									comment={comment}
									shouldRenderReadEditor={true}
								/>
							))}
					</>
				)}
			</div>

			<div className="flex flex-row justify-center items-start w-full max-w-3xl gap-x-3">
				<UserAvatar
					size="sm"
					profileImageUrl={actorUser.profileImageUrl}
					name={actorUser.fullName}
				/>
				{editor !== null && (
					<ThreadReplyInput
						commentsContext={commentsContext}
						editor={editor}
						commentThread={commentThread}
					/>
				)}
			</div>
		</>
	);
}

function ConsolePage({
	context,
	consoleLogsFile,
}: {
	context: PageToolbarContext<{
		isOnline: true;
		actorType: 'User';
		hasProject: true;
	}>;
	consoleLogsFile: ClientDoc<'File'> | null;
}) {
	const commentsContext = useCommentsContext({ context });
	const { isLoading, parsedContents } = useFile(
		consoleLogsFile,
		(text) => jsonl.parse<ConsoleLogEntry>(text),
	);

	if (isLoading) {
		return <Skeleton className="h-full w-full" />;
	}

	return (
		<ConsoleLogs
			consoleLogs={parsedContents ?? undefined}
			container={commentsContext.commentsState.container}
		/>
	);
}

function NetworkPage({
	context,
	networkLogEntriesFile,
}: {
	context: PageToolbarContext<{
		isOnline: true;
		actorType: 'User';
		hasProject: true;
	}>;
	networkLogEntriesFile: ClientDoc<'File'> | null;
}) {
	const commentsContext = useCommentsContext({ context });
	const { isLoading, parsedContents } = useFile(
		networkLogEntriesFile,
		(text) => jsonl.parse<NetworkLogEntry>(text),
	);

	if (isLoading) {
		return <Skeleton className="w-8 h-8" />;
	}

	if (parsedContents === null || parsedContents.length === 0) {
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
			networkLogs={parsedContents}
			commentsContext={commentsContext}
		/>
	);
}

function MetadataPage({
	commentThread,
}: {
	commentThread: ClientDoc<
		typeof ProjectCommentThread_$tunnelInstancePageToolbarData
	>;
	context: PageToolbarContext<{
		isOnline: true;
		actorType: 'User';
		hasProject: true;
	}>;
}) {
	return (
		<MetadataCard
			commentThread={commentThread}
		/>
	);
}
