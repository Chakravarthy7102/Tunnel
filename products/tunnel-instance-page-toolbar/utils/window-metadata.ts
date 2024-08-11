import Parser from 'ua-parser-js';

export function getBrowser() {
	const parser = new Parser();
	const { name, version } = parser.getBrowser();
	return { name: name ?? null, version: version ?? null };
}

export function getOS() {
	const parser = new Parser();
	const { name, version } = parser.getOS();

	return { name: name ?? null, version: version ?? null };
}
