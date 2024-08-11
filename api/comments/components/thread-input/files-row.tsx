import { ExpandableImage } from '#components/expandable-image.tsx';
import type { CommentsContext } from '#types';
import { AspectRatio, cn, Skeleton } from '@-/design-system/v1';
import { RrwebPlayerPreviewFromLocalFile } from '@-/rrweb-player';
import { X } from 'lucide-react';
import {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useMemo,
} from 'react';

export function FilesRow({
	files,
	setFiles,
	commentsContext,
	sessionEventsFile,
	sessionEventsThumbnailFile,
	setSessionEvents,
	setSessionEventsThumbnail,
	initialFilePromise,
	setInitialFilePromise,
	className,
}: {
	files: File[];
	setFiles: Dispatch<SetStateAction<File[]>>;
	commentsContext: CommentsContext;
	sessionEventsFile: File | null;
	sessionEventsThumbnailFile: File | null;
	setSessionEvents: Dispatch<SetStateAction<File | null>> | null;
	setSessionEventsThumbnail: Dispatch<SetStateAction<File | null>> | null;
	initialFilePromise: Promise<File | null> | null;
	setInitialFilePromise:
		| Dispatch<SetStateAction<Promise<File | null> | null>>
		| null;
	className?: string;
}) {
	const fileObjectUrls = useMemo(
		() => files.map((file) => globalThis.URL.createObjectURL(file)),
		[files],
	);

	useEffect(() => {
		if (initialFilePromise && setInitialFilePromise) {
			initialFilePromise.then((file) => {
				if (file !== null) {
					setFiles((files) => [file, ...files]);
				}

				setInitialFilePromise(null);
			}).catch(() => {
				setInitialFilePromise(null);
			});
		}
	}, [initialFilePromise, setInitialFilePromise, files, setFiles]);

	return files.length > 0 || sessionEventsFile !== null || initialFilePromise ?
		(
			<div
				className={cn(
					'flex flex-row justify-start w-full gap-3 flex-wrap',
					className,
				)}
			>
				{sessionEventsFile && setSessionEvents && setSessionEventsThumbnail && (
					<div className="flex justify-center items-center relative">
						<RrwebPlayerPreviewFromLocalFile
							sessionEventsFile={sessionEventsFile}
							container={commentsContext.commentsState.container}
							size="sm"
							sessionEventsThumbnailFile={sessionEventsThumbnailFile}
						/>
						<button
							onClick={() => {
								setSessionEvents(null);
								setSessionEventsThumbnail(null);
							}}
							className="group absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-secondary border border-solid border-[#ffffff10] flex justify-center items-center text-[10px] text-medium text-muted-foreground"
						>
							<div className="group-hover:hidden flex">{1}</div>
							<div className="group-hover:flex hidden ">
								<X size={10} />
							</div>
						</button>
					</div>
				)}

				{initialFilePromise && (
					<Skeleton className="w-12 h-12 rounded-[5px] bg-secondary border border-solid border-[#ffffff10]" />
				)}

				{files.map((file, i) => (
					<div key={i} className="flex justify-center items-center relative">
						<div className="w-12 border border-solid border-[#ffffff10] rounded-[5px] overflow-hidden bg-background">
							<AspectRatio
								ratio={1}
								className="flex flex-col justify-center items-center"
							>
								<ExpandableImage
									commentsContext={commentsContext}
									// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to exist
									src={fileObjectUrls[i]}
									type={file.type}
									className="object-cover"
								/>
							</AspectRatio>
						</div>
						<button
							onClick={() => {
								setFiles(files.filter((f) =>
									f !== file
								));
							}}
							className="group absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-secondary border border-solid border-[#ffffff10] flex justify-center items-center text-[10px] text-medium text-muted-foreground"
						>
							<div className="group-hover:hidden flex">
								{i + 1 + (sessionEventsFile ? 1 : 0)}
							</div>
							<div className="group-hover:flex hidden ">
								<X size={10} />
							</div>
						</button>
					</div>
				))}
			</div>
		) :
		null;
}
