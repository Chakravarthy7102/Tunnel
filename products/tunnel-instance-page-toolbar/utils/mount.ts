export function mountTunnelToolbar() {
	if (window !== window.top) {
		// To prevent iframe injection nesting
		return;
	}

	const tunnelToolbar = document.createElement('tunnel-toolbar');
	tunnelToolbar.style.zIndex = '999999999';
	tunnelToolbar.style.position = 'absolute';
	tunnelToolbar.style.top = '0px';
	tunnelToolbar.style.left = '0px';

	document.body.append(document.createElement('tunnel-toolbar'));
	// Frameworks can sometimes delete the element from the DOM tree, so we use a `MutationObserver` to re-add it whenever it gets removed.
	const observer = new MutationObserver(() => {
		if (document.body.querySelector('tunnel-toolbar')) {
			return;
		}

		document.body.append(tunnelToolbar);
	});

	observer.observe(document.body, { childList: true });
}

export function isTunnelToolbarMounted() {
	return document.body.querySelector('tunnel-toolbar') !== null;
}
