import type { ToolbarState } from '#types';

export const createToolbarState = (): ToolbarState => ({
	toolbarRef: null,
	position: {
		percentageLeft: 0,
		percentageTop: 0,
	},
	pos: 'bottom-center',
	obs: {
		'bottom-center': {
			top: '95%',
			left: '50%',
			flexDirection: 'row',
		},
		'top-center': {
			top: '5%',
			left: '50%',
			flexDirection: 'row',
		},
		'center-left': {
			top: '50%',
			left: '5%',
			flexDirection: 'column',
		},
		'center-right': {
			top: '50%',
			left: '95%',
			flexDirection: 'column',
		},
	},
	width: 0,
	height: 0,
	isDragging: false,
	originalDraggingCursorPosition: {
		x: 0,
		y: 0,
	},
	originalDraggingPosition: {
		x: 0,
		y: 0,
	},
});
