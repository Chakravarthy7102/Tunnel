export function isPointInsideElement(element: Element, x: number, y: number) {
	const rect = element.getBoundingClientRect();
	return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
