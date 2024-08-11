const escape = (str: string, filename?: 1) =>
	(filename ? str : str.replaceAll(/\r?\n|\r/g, '\r\n'))
		.replaceAll('\n', '%0A')
		.replaceAll('\r', '%0D')
		.replaceAll('"', '%22');

export function formDataToBlob(formData: FormData) {
	const boundary = '----formdata-polyfill-' + Math.random();
	const chunks = [];
	const prefix = `--${boundary}\r\nContent-Disposition: form-data; name="`;

	for (const [name, value] of formData) {
		if (typeof value === 'string') {
			chunks.push(
				prefix + escape(name) +
					`"\r\n\r\n${value.replaceAll(/\r(?!\n)|(?<!\r)\n/g, '\r\n')}\r\n`,
			);
		} else {
			chunks.push(
				prefix + escape(name) + `"; filename="${escape(value.name, 1)}"\r\n` +
					`Content-Type: ${value.type || 'application/octet-stream'}\r\n\r\n`,
				value,
				'\r\n',
			);
		}
	}

	chunks.push(`--${boundary}--`);

	return new Blob(chunks, {
		type: 'multipart/form-data; boundary=' + boundary,
	});
}
