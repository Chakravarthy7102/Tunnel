import {
	useSessionEventsFromFileDoc,
	useSessionEventsFromLocalFile,
} from '#hooks/use-session-events.ts';
import type { ClientDoc } from '@-/client-doc';
import {
	cn,
	Dialog,
	DialogContentUnstyled,
	DialogTrigger,
	Skeleton,
} from '@-/design-system/v1';
import { Play } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { PlayerContextProvider, type PlayerRef } from './player-context.tsx';
import { RrwebPlayerFull } from './rrweb-player-full.tsx';

export function RrwebPlayerPreviewFromLocalFile({
	sessionEventsFile,
	sessionEventsThumbnailFile,
	container,
	size,
}: {
	sessionEventsFile: File;
	container: HTMLElement | null;
	size: 'lg' | 'md' | 'sm';
	sessionEventsThumbnailFile: File | null;
}) {
	const [_playerTime, setCurrentPlayerTime] = useState(0);

	const playerRef = useRef<PlayerRef>(null);

	const { sessionEvents } = useSessionEventsFromLocalFile({
		sessionEventsFile,
	});

	const sessionEventsThumbnailFileObjectUrl = useMemo(
		() =>
			sessionEventsThumbnailFile === null ?
				null :
				globalThis.URL.createObjectURL(sessionEventsThumbnailFile),
		[sessionEventsThumbnailFile],
	);

	return (
		<Dialog>
			<DialogTrigger className="hover:cursor-zoom-in">
				{sessionEvents.length > 0 ?
					(
						<PlayerContextProvider
							ref={playerRef}
							events={sessionEvents}
							key={'recorder'}
							onPlayerTimeChange={setCurrentPlayerTime}
							onNext={() => {}}
							onPrevious={() => {}}
							duration={sessionEvents.at(-1).timestamp -
								sessionEvents[0].timestamp}
							isBuffering={false}
							autoFocus={false}
						>
							<div
								className={cn(
									'relative border border-solid border-border rounded-[5px] group bg-background/80',
									size === 'lg' ?
										'w-[240px] h-[135px]' :
										size === 'md' ?
										'w-36 h-20' :
										'w-12 h-12',
								)}
							>
								<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
									{sessionEventsThumbnailFileObjectUrl !== null ?
										(
											<img
												src={sessionEventsThumbnailFileObjectUrl}
												alt="Session Events Thumbnail"
												className="max-w-full max-h-full"
											/>
										) :
										(
											<div className="w-full h-full bg-background rounded-[5px]" />
										)}

									<PlayOverlay size={size} />
								</div>
							</div>
						</PlayerContextProvider>
					) :
					(
						<Skeleton
							className={cn(
								'relative rounded-[5px] group',
								size === 'lg' ?
									'w-[240px] h-[135px]' :
									size === 'md' ?
									'w-36 h-20' :
									'w-12 h-12',
							)}
						/>
					)}
			</DialogTrigger>
			<DialogContentUnstyled
				container={container}
				className="max-w-[80vw] w-auto bg-background relative"
			>
				<RrwebPlayerFull
					inDialog={true}
					initialEvents={sessionEvents}
					className="relative w-full h-[60vh]"
				/>
			</DialogContentUnstyled>
		</Dialog>
	);
}

export function RrwebPlayerPreviewFromFileDoc({
	sessionEventsFile,
	sessionEventsThumbnailFile,
	container,
	size,
}: {
	sessionEventsFile: ClientDoc<'File'>;
	sessionEventsThumbnailFile: ClientDoc<'File'> | null;
	container: HTMLElement | null;
	size: 'lg' | 'md' | 'sm';
}) {
	const [_playerTime, setCurrentPlayerTime] = useState(0);

	const playerRef = useRef<PlayerRef>(null);

	const { sessionEvents, sessionThumbnail } = useSessionEventsFromFileDoc({
		sessionEventsFile,
		sessionEventsThumbnailFile,
	});

	const sessionThumbnailFileObjectUrl = useMemo(
		() =>
			sessionThumbnail === null ?
				null :
				globalThis.URL.createObjectURL(sessionThumbnail),
		[sessionThumbnail],
	);

	return (
		<Dialog>
			<DialogTrigger className="hover:cursor-zoom-in">
				{sessionEvents.length > 0 ?
					(
						<PlayerContextProvider
							ref={playerRef}
							events={sessionEvents}
							key={'recorder'}
							onPlayerTimeChange={setCurrentPlayerTime}
							onNext={() => {}}
							onPrevious={() => {}}
							duration={sessionEvents.at(-1).timestamp -
								sessionEvents[0].timestamp}
							isBuffering={false}
							autoFocus={false}
						>
							<div
								className={cn(
									'relative border border-solid border-border rounded-[5px] group bg-background/80',
									size === 'lg' ?
										'w-[240px] h-[135px]' :
										size === 'md' ?
										'w-36 h-20' :
										'w-12 h-12',
								)}
							>
								<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
									{sessionThumbnailFileObjectUrl !== null ?
										(
											<img
												src={sessionThumbnailFileObjectUrl}
												alt="Session Events Thumbnail"
												className="max-w-full max-h-full"
											/>
										) :
										(
											<div className="w-full h-full bg-background rounded-[5px]" />
										)}

									<PlayOverlay size={size} />
								</div>
							</div>
						</PlayerContextProvider>
					) :
					(
						<Skeleton
							className={cn(
								'relative rounded-[5px] group',
								size === 'lg' ?
									'w-[240px] h-[135px]' :
									size === 'md' ?
									'w-36 h-20' :
									'w-12 h-12',
							)}
						/>
					)}
			</DialogTrigger>
			<DialogContentUnstyled
				container={container}
				className="max-w-[80vw] w-auto bg-background relative"
			>
				<RrwebPlayerFull
					initialEvents={sessionEvents}
					className="relative w-full h-[60vh]"
					inDialog={true}
				/>
			</DialogContentUnstyled>
		</Dialog>
	);
}

function PlayOverlay({
	size,
}: {
	size: 'sm' | 'md' | 'lg';
}) {
	return (
		<div className="absolute top-0 left-0 w-full h-full flex items-center justify-center ">
			<div
				className={cn(
					size === 'lg' ?
						'h-12 w-12' :
						size === 'md' ?
						'h-8 w-8' :
						'h-6 w-6',
					' rounded-full bg-accent/80 flex justify-center items-center',
				)}
			>
				<Play
					size={size === 'lg' ? 24 : size === 'md' ? 16 : 12}
					className="fill-white stroke-[1.5px]"
				/>
			</div>
		</div>
	);
}
