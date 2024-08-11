import { cn } from '@-/design-system/v1';
import { useRef, useState } from 'react';
import { PlayerController } from './controller.tsx';
import { PlayerFrame } from './frame.tsx';
import { PlayerContextProvider, type PlayerRef } from './player-context.tsx';

export function RrwebPlayerFull({
	initialEvents,
	className,
	inDialog,
}: {
	initialEvents: any[];
	className?: string;
	inDialog: boolean;
}) {
	const [_playerTime, setCurrentPlayerTime] = useState(0);

	const playerRef = useRef<PlayerRef>(null);

	if (initialEvents.length === 0) return null;

	return (
		<div className="border border-solid border-border rounded-md w-full h-auto">
			<PlayerContextProvider
				ref={playerRef}
				events={initialEvents}
				key={'recorder'}
				onPlayerTimeChange={setCurrentPlayerTime}
				onNext={() => {}}
				onPrevious={() => {}}
				duration={initialEvents.length > 0 ?
					(initialEvents.at(-1).timestamp - initialEvents[0].timestamp) :
					0}
				isBuffering={false}
				autoFocus={true}
			>
				<div className={cn('ph-frame-wrapper', className)}>
					<PlayerFrame inDialog={inDialog} />
				</div>
				<PlayerController />
			</PlayerContextProvider>
		</div>
	);
}
