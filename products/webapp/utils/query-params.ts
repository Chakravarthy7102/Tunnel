export function addQueryParams(
	{ param, value }: { param: string; value: string },
) {
	const url = new URL(window.location.href);

	url.searchParams.set(param, value);
	window.history.replaceState({}, '', url.toString());
}

export function removeQueryParams({ param }: { param: string }) {
	const url = new URL(window.location.href);

	url.searchParams.delete(param);
	window.history.replaceState({}, '', url.toString());
}
