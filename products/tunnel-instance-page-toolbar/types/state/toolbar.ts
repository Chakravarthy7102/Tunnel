interface Obs {
	top: string;
	left: string;
	flexDirection: 'row' | 'column';
}

export interface ToolbarState {
	toolbarRef: HTMLDivElement | null;
	position: {
		percentageLeft: number;
		percentageTop: number;
	};
	pos: 'bottom-center' | 'top-center' | 'center-left' | 'center-right';
	obs: {
		'bottom-center': Obs;
		'top-center': Obs;
		'center-left': Obs;
		'center-right': Obs;
	};
	width: number;
	height: number;
	isDragging: boolean;
	originalDraggingCursorPosition: {
		x: number;
		y: number;
	};
	originalDraggingPosition: {
		x: number;
		y: number;
	};
}
