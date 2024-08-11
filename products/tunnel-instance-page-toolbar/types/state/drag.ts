export interface DragState {
	isDragging: boolean;
	currentPosition: {
		x: number;
		y: number;
	};
	originalPosition: {
		x: number;
		y: number;
	};
	originalCursorPosition: {
		x: number;
		y: number;
	};
}
