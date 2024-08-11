import {
	Button,
	cn,
	Dialog,
	DialogContent,
	DialogHeader,
} from '@-/design-system/v1';
import { SuperJSON } from '@-/superjson';
import { ChevronRightSquare } from 'lucide-react';
import { useState } from 'react';
import type { NetworkLogDataTableEntry } from './columns.tsx';

export function InformationDialog({
	setIsOpen,
	networkLogEntry,
	container,
}: {
	setIsOpen: (isOpen: boolean) => void;
	networkLogEntry: NetworkLogDataTableEntry | null;
	container: HTMLElement | null;
}) {
	const [page, setPage] = useState<'headers' | 'request' | 'response'>(
		'headers',
	);

	return (
		<Dialog
			open={networkLogEntry !== null}
			onOpenChange={setIsOpen}
		>
			<DialogContent
				container={container}
				className="text-foreground"
			>
				<DialogHeader>
					<div className="flex flex-row justify-start items-center gap-x-0.5 w-full ">
						<Button
							variant="ghost"
							onClick={() => {
								setPage('headers');
							}}
							className={cn(page === 'headers' && 'bg-accent')}
						>
							Headers
						</Button>
						<Button
							variant="ghost"
							onClick={() => {
								setPage('request');
							}}
							className={cn(page === 'request' && 'bg-accent')}
						>
							Request
						</Button>
						<Button
							variant="ghost"
							onClick={() => {
								setPage('response');
							}}
							className={cn(page === 'response' && 'bg-accent')}
						>
							Response
						</Button>
					</div>
				</DialogHeader>
				{networkLogEntry !== null && (
					<div>
						{page === 'headers' && (
							<HeadersPage
								networkLogEntry={networkLogEntry}
							/>
						)}
						{page === 'request' && (
							<RequestPage
								networkLogEntry={networkLogEntry}
							/>
						)}
						{page === 'response' && (
							<ResponsePage networkLogEntry={networkLogEntry} />
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

function Row({
	keyNode,
	valueNode,
}: {
	keyNode: React.ReactNode;
	valueNode: React.ReactNode;
}) {
	return (
		<div className="flex flex-row justify-between items-start w-full border-solid border-b border-b-input last:border-none px-4 py-2 gap-x-2">
			<div className="text-sm font-light text-muted-foreground min-w-max">
				{keyNode}
			</div>
			<div className="text-sm font-light">{valueNode}</div>
		</div>
	);
}

function HeadersPage(
	{ networkLogEntry }: { networkLogEntry: NetworkLogDataTableEntry },
) {
	return (
		<div className="h-auto max-h-[400px] overflow-y-auto flex flex-col justify-start items-center w-full p-4 gap-y-2">
			<div className="flex flex-col justify-start items-start bg-accent border border-solid border-input w-full h-full rounded-md">
				<div className="flex flex-row justify-start items-start border-b border-input border-solid w-full px-4 py-2">
					<p className="font-medium">General</p>
				</div>
				<div className="flex flex-col justify-center items-center w-full">
					<Row
						keyNode={'Request URL'}
						valueNode={networkLogEntry.domain}
					/>
					<Row
						keyNode={'Request Method'}
						valueNode={networkLogEntry.method}
					/>
					<Row
						keyNode={'Status'}
						valueNode={
							<div className="flex items-center gap-x-2">
								<div
									className={cn('h-2 w-2 rounded-full', {
										'bg-gray-500': networkLogEntry.status < 200 ||
											networkLogEntry.status >= 600, // Default color for unknown networkLogEntry.status codes
										'bg-green-500': networkLogEntry.status >= 200 &&
											networkLogEntry.status < 300, // Success
										'bg-blue-500': networkLogEntry.status >= 300 &&
											networkLogEntry.status < 400, // Redirects
										'bg-yellow-500': networkLogEntry.status >= 400 &&
											networkLogEntry.status < 500, // Client errors
										'bg-red-500': networkLogEntry.status >= 500 &&
											networkLogEntry.status < 600, // Server errors
									})}
								/>
								{networkLogEntry.status}
							</div>
						}
					/>
				</div>
			</div>
			{Object.entries(networkLogEntry.responseHeaders).length > 0 && (
				<div className="flex flex-col justify-start items-start bg-accent border border-solid border-input w-full h-full rounded-md">
					<div className="flex flex-row justify-start items-start border-b border-input border-solid w-full px-4 py-2">
						<p className="font-medium">Response Headers</p>
					</div>
					<div className="flex flex-col justify-center items-center w-full">
						{Object.entries(networkLogEntry.responseHeaders).map((
							[key, value],
						) => <Row keyNode={key} valueNode={value} key={key} />)}
					</div>
				</div>
			)}
			{Object.entries(networkLogEntry.requestHeaders).length > 0 && (
				<div className="flex flex-col justify-start items-start bg-accent border border-solid border-input w-full h-full rounded-md">
					<div className="flex flex-row justify-start items-start border-b border-input border-solid w-full px-4 py-2">
						<p className="font-medium">Request Headers</p>
					</div>
					<div className="flex flex-col justify-center items-center w-full">
						{Object.entries(networkLogEntry.requestHeaders).map((
							[key, value],
						) => <Row keyNode={key} valueNode={value} key={key} />)}
					</div>
				</div>
			)}
		</div>
	);
}

function RequestPage(
	{ networkLogEntry }: { networkLogEntry: NetworkLogDataTableEntry },
) {
	let body = networkLogEntry.requestBody === '' ?
		null :
		networkLogEntry.requestBody;

	body = body !== null ? SuperJSON.parse(body) : null;

	return (
		<div className="h-auto h-[400px] overflow-y-auto flex flex-col justify-start items-center w-full p-4">
			{networkLogEntry.requestBody}
			<div className="flex flex-col justify-start items-start p-4 bg-accent border border-solid border-input w-full h-full rounded-md">
				{body ?? (
					<div className="h-full w-full flex flex-col justify-center items-center gap-y-2">
						<ChevronRightSquare
							size={48}
							className="text-muted-foreground"
						/>
						<p className="text-muted-foreground">
							Nothing to see here
						</p>
					</div>
				)}
			</div>
		</div>
	);
}

function ResponsePage(
	{ networkLogEntry }: { networkLogEntry: NetworkLogDataTableEntry },
) {
	let body = networkLogEntry.responseBody === '' ?
		null :
		networkLogEntry.responseBody;

	body = body !== null ? SuperJSON.parse(body) : null;

	return (
		<div className="h-auto h-[400px] overflow-y-auto flex flex-col justify-start items-center w-full p-4">
			<div className="flex flex-col justify-start items-start p-4 bg-accent border border-solid border-input w-full h-full rounded-md">
				{body === null ?
					(
						<div className="h-full w-full flex flex-col justify-center items-center gap-y-2">
							<ChevronRightSquare
								size={48}
								className="text-muted-foreground"
							/>
							<p className="text-muted-foreground">
								Nothing to see here
							</p>
						</div>
					) :
					JSON.stringify(body)}
			</div>
		</div>
	);
}
