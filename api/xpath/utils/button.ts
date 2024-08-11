export function isButton(element: Element): boolean {
	const tagName = element.tagName.toLowerCase();
	const type = element.getAttribute('type');

	if (tagName === 'button') {
		return true;
	}

	if (
		tagName === 'input' && ['button', 'submit', 'reset'].includes(type ?? '')
	) {
		return true;
	}

	return false;
}
