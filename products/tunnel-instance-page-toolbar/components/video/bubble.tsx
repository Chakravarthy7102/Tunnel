import { Draggable } from '#components/ui/draggable.tsx';
import type { PageToolbarContext } from '#types';
import { useContextStore } from '#utils/context/use.ts';
import { useDraggable } from '#utils/drag.ts';
import { zIndex } from '#utils/z-index.ts';
import { select } from '@-/client-doc';
import {
	DailyAudio,
	DailyVideo,
	useLocalParticipant,
} from '@daily-co/daily-react';
import { useCallback, useEffect, useRef } from 'react';
import { SettingsBar } from './settings/settings-bar.tsx';

export function VideoBubble({
	context,
}: {
	context: PageToolbarContext<{
		actorType: 'User';
		hasProjectLivePreview: true;
		isOnline: true;
	}>;
}) {
	const state = useContextStore(context);
	const participant = useLocalParticipant();
	const videoBubbleRef = useRef<HTMLVideoElement | null>(null);
	const emptyVideoBubbleRef = useRef<HTMLDivElement | null>(null);
	const videoBubbleDraggable = useDraggable(
		state.videoBubble.dragState,
	);

	const bubbleContainerElementRef = useRef<HTMLDivElement | null>(null);
	const bubbleContainerRef = useCallback(
		(bubbleContainer: HTMLDivElement | null) => {
			videoBubbleDraggable.setDragElement(bubbleContainer);
			if (bubbleContainer === null) return;

			const { width, height } = bubbleContainer.getBoundingClientRect();

			state.videoBubble.dragState.currentPosition = {
				x: window.innerWidth - width - 20,
				y: window.innerHeight - height - 20,
			};

			state.videoBubble.bubbleContainerDimensions = {
				width,
				height,
			};

			bubbleContainerElementRef.current = bubbleContainer;
		},
		[],
	);

	useEffect(() => {
		if (bubbleContainerElementRef.current === null) {
			return;
		}

		const { width, height } = bubbleContainerElementRef.current
			.getBoundingClientRect();

		context.store.setState((state) => ({
			...state,
			videoBubble: {
				...state.videoBubble,
				bubbleContainerDimensions: {
					width,
					height,
				},
			},
		}));
	}, [state.videoBubble.bubbleVideoDimensions]);

	const { x: xPos, y: yPos } = state.videoBubble.dragState.currentPosition;

	if (participant === null) {
		return null;
	}

	if (!state.hasUserJoinedDailyRoom) {
		return null;
	}

	const participantUser = select(
		state,
		'User',
		participant.user_id,
		{ user: true },
	);

	return (
		<Draggable xPos={xPos} yPos={yPos}>
			<div
				ref={bubbleContainerRef}
				className="bg-[#111] fixed rounded-[5px] border border-[#333] border-solid flex flex-col items-center justify-center overflow-hidden"
				style={{
					zIndex: zIndex.video,
				}}
			>
				<div className="w-[200px] h-[200px]">
					{/* If the participant's video is off and they're the active speaker, then show their avatar instead of the DailyVideo */}
					{participant.tracks.video.state === 'off' &&
							state.videoBubble.dailyActiveSpeakerSessionId ===
								participant.session_id ?
						(
							<div
								ref={emptyVideoBubbleRef}
								className=" bg-[#111] flex flex-col items-center justify-center w-full h-full"
							>
								{participantUser?.profileImageUrl && (
									<img
										src={participantUser.profileImageUrl}
										className="h-20 w-20 rounded-full"
										draggable={false}
									/>
								)}
							</div>
						) :
						(
							<DailyVideo
								ref={videoBubbleRef}
								fit="cover"
								type="video"
								sessionId={state.videoBubble.dailyActiveSpeakerSessionId ??
									participant.session_id}
								style={{
									objectFit: 'cover',
								}}
								className="w-full h-full"
							/>
						)}
				</div>

				<DailyAudio />
				{/* <ParticipantsBar context={context} /> */}
				<SettingsBar context={context} />
			</div>
		</Draggable>
	);
}
