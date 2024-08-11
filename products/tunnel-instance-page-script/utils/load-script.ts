/**
	Before loading the toolbar, we need to load the tunneled page data
*/

export function loadScriptSync({
	src,
	...extraAttributes
}: {
	src: string;
} & Record<string, string>) {
	const s = Object.assign(document.createElement('script'), {
		src,
		type: 'text/javascript',
		async: false,
		...extraAttributes,
	});

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Document is guaranteed to have a <head> element
	document.getElementsByTagName('head')[0]!.append(s);
}
