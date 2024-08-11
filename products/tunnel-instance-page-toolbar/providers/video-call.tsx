import type { PageToolbarContext } from '#types';
import { useOnceEffect } from '#utils/effect.ts';
import { type PropsWithChildren } from 'react';

export function VideoCallProvider({
	children,
}: PropsWithChildren<{
	context: PageToolbarContext<{
		actorType: 'User';
		hasProjectLivePreview: true;
		isOnline: true;
	}>;
}>) {
	useOnceEffect(() => {
		// state.dailyCallObject.on('active-speaker-change', () => {
		// 	const { dailyCallObject, videoBubble } = context.store.getState();
		// 	const activeSpeakerSessionId =
		// 		state.dailyCallObject.getActiveSpeaker().peerId;

		// 	const localParticipant = dailyCallObject.participants().local;
		// 	// If the active speaker is you, we only switch to you when there isn't already an active speaker
		// 	if (activeSpeakerSessionId === localParticipant.session_id) {
		// 		if (videoBubble.dailyActiveSpeakerSessionId === null) {
		// 			videoBubble.dailyActiveSpeakerSessionId = activeSpeakerSessionId;
		// 		}
		// 	}

		// 	if (activeSpeakerSessionId !== undefined) {
		// 		videoBubble.dailyActiveSpeakerSessionId = activeSpeakerSessionId;
		// 	}
		// });
	});

	return children;
}
