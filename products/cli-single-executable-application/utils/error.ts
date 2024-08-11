export function displayDownloadErrorMessageAndExit({
	error,
}: {
	error: any;
}): never {
	console.error(
		"😬 We couldn't download the latest version of the Tunnel CLI (this is likely our fault); please shoot us a message at https://tunnel.dev/support",
	);
	console.error('Error:', error);
	process.exit(1);
}
