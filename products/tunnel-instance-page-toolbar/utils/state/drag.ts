import type { DragState } from '#types';

export const createDragState = (): DragState => ({
	isDragging: false,
	currentPosition: {
		x: 0,
		y: 0,
	},
	originalPosition: {
		x: 0,
		y: 0,
	},
	originalCursorPosition: {
		x: 0,
		y: 0,
	},
});
