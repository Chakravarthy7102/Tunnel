import type { CursorRelativePosition } from '#types';
import getXpath from 'get-xpath';

export function getCursorRelativePosition({
	cursorX,
	cursorY,
}: {
	cursorX: number;
	cursorY: number;
}): CursorRelativePosition | null {
	const element = document.elementFromPoint(cursorX, cursorY);
	if (element === null) {
		return null;
	}

	const hoveredElementXpath = getXpath(element);
	if (hoveredElementXpath === '') {
		return null;
	}

	const { x, y, width, height } = element.getBoundingClientRect();
	const percentageLeft = ((cursorX - x) / width) * 100;
	const percentageTop = ((cursorY - y) / height) * 100;

	return {
		hoveredElementXpath,
		percentageLeft,
		percentageTop,
	};
}
