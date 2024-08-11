import type { CursorSection, VideoBubbleState } from '#types';
import { createDragState } from '#utils/state/drag.ts';

export const createVideoBubbleState = (): VideoBubbleState => ({
	microphoneDeviceId: null,
	speakerDeviceId: null,
	videoDeviceId: null,
	isResizingVideoBubble: false,
	resizeDirection: 'top-left' as CursorSection,
	documentCursor: null as string | null,
	originalResizingVideoBubbleDimensions: { width: 0, height: 0 },
	originalResizingVideoBubblePosition: {
		x: 0,
		y: 0,
	},
	originalResizingVideoBubbleCursorPosition: {
		x: 0,
		y: 0,
	},
	dragState: createDragState(),
	objectPosition: createDragState(),
	videoAspectRatio: 0,
	dailyVideoDimensions: { width: 200, height: 200 },
	bubbleVideoDimensions: {
		width: 200,
		height: 200,
	},
	// This should only change via `useEffect` and re-measuring the container dimensions
	bubbleContainerDimensions: {
		height: 0,
		width: 0,
	},
	zoomLevel: 1,
	dailyActiveSpeakerSessionId: null as string | null,
});
