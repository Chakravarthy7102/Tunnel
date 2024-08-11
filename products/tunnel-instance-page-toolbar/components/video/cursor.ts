import type { CursorSection, PageToolbarContext } from '#types';

export function isCursorOnBorder(_args: { cursorX: number; cursorY: number }) {
	// TODO: Implement resizing
	return false;
}

export const resizeDirectionToCursor = {
	'top-left': 'nwse-resize',
	'top-middle': 'ns-resize',
	'top-right': 'nesw-resize',
	'middle-left': 'ew-resize',
	'middle-right': 'ew-resize',
	'bottom-left': 'nesw-resize',
	'bottom-middle': 'ns-resize',
	'bottom-right': 'nwse-resize',
};

// eslint-disable-next-line complexity -- complex function
export function getCursorSection({
	context,
	cursorX,
	cursorY,
}: {
	context: PageToolbarContext<{
		hasProjectLivePreview: true;
	}>;
	cursorX: number;
	cursorY: number;
}): CursorSection | null {
	// Set the cursor based on which section of the circle it's on when the circle is divided equally into 3 rows and 3 columns
	const x = cursorX;
	const y = cursorY;
	const state = context.store.getState();
	const bubbleX = state.videoBubble.dragState.currentPosition.x;
	const bubbleY = state.videoBubble.dragState.currentPosition.y;
	const bubbleWidth = state.videoBubble.bubbleVideoDimensions.width;
	const bubbleHeight = state.videoBubble.bubbleVideoDimensions.height;

	// Top left
	if (x < bubbleX + bubbleWidth / 3 && y < bubbleY + bubbleHeight / 3) {
		return 'top-left';
	} // Top middle
	else if (
		x > bubbleX + bubbleWidth / 3 &&
		x < bubbleX + bubbleWidth - bubbleWidth / 3 &&
		y < bubbleY + bubbleHeight / 3
	) {
		return 'top-middle';
	} // Top right
	else if (
		x > bubbleX + bubbleWidth - bubbleWidth / 3 &&
		y < bubbleY + bubbleHeight / 3
	) {
		return 'top-right';
	} // Middle left
	else if (
		x < bubbleX + bubbleWidth / 3 &&
		y > bubbleY + bubbleHeight / 3 &&
		y < bubbleY + bubbleHeight - bubbleHeight / 3
	) {
		return 'middle-left';
	} // Middle right
	else if (
		x > bubbleX + bubbleWidth - bubbleWidth / 3 &&
		y > bubbleY + bubbleHeight / 3 &&
		y < bubbleY + bubbleHeight - bubbleHeight / 3
	) {
		return 'middle-right';
	} // Bottom left
	else if (
		x < bubbleX + bubbleWidth / 3 &&
		y > bubbleY + bubbleHeight - bubbleHeight / 3
	) {
		return 'bottom-left';
	} // Bottom middle
	else if (
		x > bubbleX + bubbleWidth / 3 &&
		x < bubbleX + bubbleWidth - bubbleWidth / 3 &&
		y > bubbleY + bubbleHeight - bubbleHeight / 3
	) {
		return 'bottom-middle';
	} // Bottom right
	else if (
		x > bubbleX + bubbleWidth - bubbleWidth / 3 &&
		y > bubbleY + bubbleHeight - bubbleHeight / 3
	) {
		return 'bottom-right';
	} // Middle
	else if (
		x > bubbleX + bubbleWidth / 3 &&
		x < bubbleX + bubbleWidth - bubbleWidth / 3 &&
		y > bubbleY + bubbleHeight / 3 &&
		y < bubbleY + bubbleHeight - bubbleHeight / 3
	) {
		return 'middle';
	}

	return null;
}

export function isCursorInBubble(_args: { cursorX: number; cursorY: number }) {
	// TODO
	return true;
}

export function resizeBubble({
	context,
	newDimensions,
}: {
	context: PageToolbarContext<{
		hasProjectLivePreview: true;
	}>;
	newDimensions: { width: number; height: number };
}) {
	const state = context.store.getState();
	const objectPositionPercents = {
		x: state.videoBubble.objectPosition.currentPosition.x /
			state.videoBubble.dailyVideoDimensions.width,
		y: state.videoBubble.objectPosition.currentPosition.y /
			state.videoBubble.dailyVideoDimensions.height,
	};

	if (
		state.videoBubble.dailyVideoDimensions.width >=
			state.videoBubble.dailyVideoDimensions.height
	) {
		context.store.setState((state) => ({
			...state,
			videoBubble: {
				...state.videoBubble,
				dailyVideoDimensions: {
					width: state.videoBubble.bubbleVideoDimensions.width *
						state.videoBubble.videoAspectRatio,
					height: state.videoBubble.bubbleVideoDimensions.height,
				},
			},
		}));
	} else {
		context.store.setState((state) => ({
			...state,
			videoBubble: {
				...state.videoBubble,
				dailyVideoDimensions: {
					width: state.videoBubble.bubbleVideoDimensions.width,
					height: state.videoBubble.bubbleVideoDimensions.height /
						state.videoBubble.videoAspectRatio,
				},
			},
		}));
	}

	context.store.setState((state) => ({
		...state,
		videoBubble: {
			...state.videoBubble,
			bubbleVideoDimensions: newDimensions,
			objectPosition: {
				...state.videoBubble.objectPosition,
				currentPosition: {
					x: objectPositionPercents.x *
						state.videoBubble.dailyVideoDimensions.width,
					y: objectPositionPercents.y *
						state.videoBubble.dailyVideoDimensions.height,
				},
			},
		},
	}));
}
