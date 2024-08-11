import { ConsoleLogs } from '#components/console/console-logs.tsx';
import { NetworkLogsTable } from '#components/network-logs/table.tsx';
import type { CommentsContext } from '#types';
import type { ClientDoc } from '@-/client-doc';
import type { ProjectCommentThread_$commentsProviderData } from '@-/database/selections';
import {
	Android,
	Apple,
	Badge,
	Button,
	Chrome,
	cn,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
	Firefox,
	Linux,
	Opera,
	Safari,
	Spinner,
	Windows,
} from '@-/design-system/v1';
import { useFile } from '@-/file/react';
import type { ConsoleLogEntry, NetworkLogEntry } from '@-/logs';
import { jsonl } from 'js-jsonl';
import {
	ChevronRightSquare,
	GitBranch,
	Laptop,
	Network,
} from 'lucide-react';
import React, { useState } from 'react';

export function EnvironmentDialogButton({
	commentsContext,
	commentThread,
	size,
}: {
	commentsContext: CommentsContext;
	commentThread: ClientDoc<typeof ProjectCommentThread_$commentsProviderData>;
	size: 'sm' | 'md';
}) {
	const { commentsState } = commentsContext;

	const [page, setPage] = useState<'console' | 'network' | 'window' | 'git'>(
		'console',
	);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Badge size={size} className="hover:bg-accent hover:cursor-pointer">
					<Laptop size={14} className="text-muted-foreground" />
					Environment
				</Badge>
			</DialogTrigger>
			<DialogContent container={commentsState.container}>
				<DialogHeader>
					<div className="flex flex-row justify-start items-center gap-x-0.5 w-full">
						{
							<Button
								variant="ghost"
								onClick={() => {
									setPage('console');
								}}
								className={cn(page === 'console' && 'bg-accent')}
							>
								<ChevronRightSquare
									size={14}
									className="text-muted-foreground"
								/>
								Console
								<Badge size={'sm'}>
									{commentThread.consoleLogEntriesCount}
								</Badge>
							</Button>
						}
						{
							<Button
								variant="ghost"
								onClick={() => {
									setPage('network');
								}}
								className={cn(page === 'network' && 'bg-accent')}
							>
								<Network size={14} className="text-muted-foreground" />
								Network
								<Badge size={'sm'}>
									{commentThread.networkLogEntriesCount}
								</Badge>
							</Button>
						}
						<Button
							variant="ghost"
							onClick={() => {
								setPage('window');
							}}
							className={cn(page === 'window' && 'bg-accent')}
						>
							<Laptop size={14} className="text-muted-foreground" />
							Window
						</Button>
						<Button
							variant="ghost"
							onClick={() => {
								setPage('git');
							}}
							className={cn(page === 'git' && 'bg-accent')}
						>
							<GitBranch size={14} className="text-muted-foreground" />
							Git
						</Button>
					</div>
				</DialogHeader>

				{page === 'console' &&
					(
						<ConsolePage
							commentsContext={commentsContext}
							consoleLogsFile={commentThread.consoleLogsFile}
						/>
					)}
				{page === 'network' &&
					(
						<NetworkPage
							commentsContext={commentsContext}
							networkLogEntriesFile={commentThread.networkLogEntriesFile}
						/>
					)}
				{page === 'git' && (
					<GitPage
						commentsContext={commentsContext}
						commentThread={commentThread}
					/>
				)}
				{page === 'window' && (
					<WindowPage
						commentsContext={commentsContext}
						commentThread={commentThread}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}

function ConsolePage({
	commentsContext,
	consoleLogsFile,
}: {
	commentsContext: CommentsContext;
	consoleLogsFile: ClientDoc<'File'> | null;
}) {
	const { isLoading, parsedContents } = useFile(
		consoleLogsFile,
		(text) => jsonl.parse<ConsoleLogEntry>(text),
	);

	if (isLoading) {
		return (
			<div className="h-[400px]">
				<div className="h-full w-full flex items-center justify-center">
					<Spinner />
				</div>
			</div>
		);
	}

	if (parsedContents === null || parsedContents.length === 0) {
		return (
			<div className="p-20 w-full flex flex-col justify-center items-center gap-y-2 h-[400px]">
				<ChevronRightSquare size={48} className="text-muted-foreground" />
				<p className="text-muted-foreground">
					Nothing to see here
				</p>
			</div>
		);
	}

	return (
		<div className="h-[400px] p-2">
			<ConsoleLogs
				container={commentsContext.commentsState.container}
				consoleLogs={parsedContents}
			/>
		</div>
	);
}

function NetworkPage({
	commentsContext,
	networkLogEntriesFile,
}: {
	commentsContext: CommentsContext;
	networkLogEntriesFile: ClientDoc<'File'> | null;
}) {
	const { isLoading, parsedContents } = useFile(
		networkLogEntriesFile,
		(text) => jsonl.parse<NetworkLogEntry>(text),
	);

	if (isLoading) {
		return (
			<div className="h-[400px]">
				<div className="h-full w-full flex items-center justify-center">
					<Spinner />
				</div>
			</div>
		);
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
		<div className="p-2 h-[400px]">
			<NetworkLogsTable
				networkLogs={parsedContents}
				commentsContext={commentsContext}
			/>
		</div>
	);
}

function WindowPage({
	commentThread,
}: {
	commentsContext: CommentsContext;
	commentThread: ClientDoc<typeof ProjectCommentThread_$commentsProviderData>;
}) {
	const MetadataIcon: { [key: string]: JSX.Element } = {
		'Windows [Phone/Mobile]': <Windows />,
		'Chrome': <Chrome />,
		'Mac OS': <Apple />,
		'Linux': <Linux />,
		'Android[-x86]': <Android />,
		'iOS': <Apple />,
		'Opera Coast': <Opera />,
		'Safari': <Safari />,
		'Mobile Safari': <Safari />,
		'Firefox [Focus/Reality]': <Firefox />,
	};

	if (commentThread.windowMetadata_ === null) {
		return (
			<div className="p-20 w-full flex flex-col justify-center items-center gap-y-2 ">
				<Laptop size={48} className="text-muted-foreground" />
				<p className="text-muted-foreground">
					Nothing to see here
				</p>
			</div>
		);
	}

	const windowMetadata = commentThread.windowMetadata_;
	const { browser, os, url, windowSize } = windowMetadata;

	return (
		<div className="h-auto max-h-[400px] overflow-y-auto flex flex-col justify-start items-center w-full ">
			{browser.name && browser.version && (
				<EnvironmentDialogRow>
					<p className="text-sm font-normal text-foreground">Browser</p>
					<p className="flex items-center font-light text-muted-foreground text-sm line-clamp-1">
						<span className="mr-2">{browser.name} {browser.version}</span>
						<span className="h-4 w-4 fill-muted-foreground">
							{MetadataIcon[browser.name] && MetadataIcon[browser.name]}
						</span>
					</p>
				</EnvironmentDialogRow>
			)}
			{os.name && os.version && (
				<EnvironmentDialogRow>
					<p className="text-sm font-normal text-foreground">
						Operating System
					</p>
					<p className="flex items-center font-light text-muted-foreground text-sm line-clamp-1">
						<span className="mr-2">{os.name} {os.version}</span>
						<span className="h-4 w-4 fill-muted-foreground">
							{MetadataIcon[os.name] && MetadataIcon[os.name]}
						</span>
					</p>
				</EnvironmentDialogRow>
			)}
			<EnvironmentDialogRow>
				<p className="text-sm font-normal text-foreground">Window Size</p>
				<p className="font-light text-muted-foreground text-sm line-clamp-1">
					{windowSize.width}x{windowSize.height}
				</p>
			</EnvironmentDialogRow>
			<EnvironmentDialogRow>
				<p className="text-sm font-normal text-foreground">URL{' '}</p>
				<a
					href={url}
					target="_blank"
					className="font-light text-muted-foreground text-sm hover:text-blue-500 hover:underline line-clamp-1"
				>
					{url}
				</a>
			</EnvironmentDialogRow>
		</div>
	);
}

function GitPage({
	commentThread,
}: {
	commentsContext: CommentsContext;
	commentThread: ClientDoc<typeof ProjectCommentThread_$commentsProviderData>;
}) {
	if (commentThread.gitMetadata_ === null) {
		return (
			<div className="p-20 w-full flex flex-col justify-center items-center gap-y-2">
				<GitBranch size={48} className="text-muted-foreground" />
				<p className="text-muted-foreground">
					Nothing to see here
				</p>
			</div>
		);
	}

	const gitMetadata = commentThread.gitMetadata_;
	const { gitUrl, commitSha, branchName } = gitMetadata;

	if (gitUrl === null && commitSha === null && branchName === null) {
		return (
			<div className="p-20 w-full flex flex-col justify-center items-center gap-y-2">
				<GitBranch size={48} className="text-muted-foreground" />
				<p className="text-muted-foreground">
					Nothing to see here
				</p>
			</div>
		);
	}

	return (
		<div className="h-auto max-h-[400px] overflow-y-auto flex flex-col justify-start items-center w-full">
			{gitUrl && (
				<EnvironmentDialogRow>
					<p className="text-sm font-normal text-foreground">
						Git&nbsp;URL{' '}
					</p>
					<a
						href={gitUrl}
						target="_blank"
						className="font-light text-muted-foreground text-sm hover:text-blue-500 hover:underline line-clamp-1"
					>
						{gitUrl}
					</a>
				</EnvironmentDialogRow>
			)}
			{commitSha && (
				<EnvironmentDialogRow>
					<p className="text-sm font-normal text-foreground">
						Latest Commit
					</p>
					<p className="font-light text-muted-foreground text-sm line-clamp-1">
						{commitSha}
					</p>
				</EnvironmentDialogRow>
			)}
			{branchName && (
				<EnvironmentDialogRow>
					<p className="text-sm font-normal text-foreground">Branch Name</p>
					<p className="font-light text-muted-foreground text-sm line-clamp-1">
						{branchName}
					</p>
				</EnvironmentDialogRow>
			)}
		</div>
	);
}

function EnvironmentDialogRow({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-row justify-between items-center px-4 py-2 border-b border-solid border-input last:border-b-0 w-full">
			{children}
		</div>
	);
}
