import type { CursorSection } from '#types';
import type { DragState } from './drag.js';

export interface VideoBubbleState {
	microphoneDeviceId: string | null;
	speakerDeviceId: string | null;
	videoDeviceId: string | null;
	isResizingVideoBubble: boolean;
	resizeDirection: CursorSection;
	documentCursor: string | null;
	originalResizingVideoBubbleDimensions: { width: number; height: number };
	originalResizingVideoBubblePosition: {
		x: number;
		y: number;
	};
	originalResizingVideoBubbleCursorPosition: {
		x: number;
		y: number;
	};
	dragState: DragState;
	objectPosition: DragState;
	videoAspectRatio: number;
	dailyVideoDimensions: { width: number; height: number };
	bubbleVideoDimensions: {
		width: number;
		height: number;
	};
	// This should only change via `useEffect` and re-measuring the container dimensions
	bubbleContainerDimensions: {
		height: number;
		width: number;
	};
	zoomLevel: number;
	dailyActiveSpeakerSessionId: string | null;
}
