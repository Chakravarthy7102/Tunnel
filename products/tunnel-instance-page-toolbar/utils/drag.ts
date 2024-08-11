import type { DragState } from '#types';
import clamp from 'just-clamp';
import { useState } from 'react';

export function useDraggable(dragState: DragState) {
	const [dragElement, setDragElement] = useState<HTMLElement | null>(null);

	const onPointerDown = (event: PointerEvent) => {
		// shadowRootHost.setPointerCapture(event.pointerId);

		dragState.isDragging = true;
		dragState.originalCursorPosition = {
			x: event.clientX,
			y: event.clientY,
		};
		dragState.originalPosition = {
			x: dragState.currentPosition.x,
			y: dragState.currentPosition.y,
		};
	};

	const onPointerMove = (event: PointerEvent) => {
		if (!dragState.isDragging) return;

		const dx = event.clientX - dragState.originalCursorPosition.x;
		const dy = event.clientY - dragState.originalCursorPosition.y;
		const rect = dragElement?.getBoundingClientRect();
		dragState.currentPosition = {
			x: clamp(
				0,
				dragState.originalPosition.x + dx,
				window.innerWidth - (rect?.width ?? 0),
			),
			y: clamp(
				0,
				dragState.originalPosition.y + dy,
				window.innerHeight - (rect?.height ?? 0),
			),
		};
	};

	const onPointerUp = () => {
		// shadowRootHost.releasePointerCapture(event.pointerId);
		dragState.isDragging = false;
	};

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp,
		setDragElement,
	};
}
