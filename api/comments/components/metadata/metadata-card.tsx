import {
	Android,
	Apple,
	Chrome,
	Firefox,
	Linux,
	Opera,
	Safari,
	Windows,
} from '@-/design-system/v1';

import type { ClientDoc } from '@-/client-doc';
import type { ProjectCommentThread_$commentsProviderData } from '@-/database/selections';
import { Laptop } from 'lucide-react';

export function MetadataCard({
	commentThread,
}: {
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

	const windowMetadata = commentThread.windowMetadata_;

	if (windowMetadata === null) {
		return (
			<div className="p-20 w-full flex flex-col justify-center items-center gap-y-2">
				<Laptop size={48} className="text-muted-foreground" />
				<p className="text-muted-foreground">
					Nothing to see here
				</p>
			</div>
		);
	}

	const { browser, os, url, windowSize } = windowMetadata;

	return (
		<div className="flex flex-col justify-start items-center w-full bg-accent border border-solid border-input rounded-[5px]">
			{browser.name && browser.version && (
				<Row
					keyNode="Browser"
					valueNode={
						<p className="flex items-center line-clamp-1">
							<span className="mr-2">{browser.name} {browser.version}</span>
							<span className="h-4 w-4 fill-muted-foreground">
								{MetadataIcon[browser.name] && MetadataIcon[browser.name]}
							</span>
						</p>
					}
				/>
			)}
			{os.name && os.version && (
				<Row
					keyNode="Operating System"
					valueNode={
						<p className="flex items-center line-clamp-1">
							<span className="mr-2">{os.name} {os.version}</span>
							<span className="h-4 w-4 fill-muted-foreground">
								{MetadataIcon[os.name] && MetadataIcon[os.name]}
							</span>
						</p>
					}
				/>
			)}
			<Row
				keyNode="Window Size"
				valueNode={`${windowSize.width}x${windowSize.height}`}
			/>
			<Row
				keyNode={'URL'}
				valueNode={
					<a
						href={url}
						target="_blank"
						className=" hover:text-blue-500 hover:underline line-clamp-1"
					>
						{url}
					</a>
				}
			/>
		</div>
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
		<div className="flex flex-row justify-between items-start w-full border-solid border-b border-b-input last:border-none px-4 py-2">
			<div className="text-sm font-light text-muted-foreground min-w-max">
				{keyNode}
			</div>
			<div className="text-sm font-light">{valueNode}</div>
		</div>
	);
}
