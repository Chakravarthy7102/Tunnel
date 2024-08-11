import { glob } from 'glob';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { readFile } from 'node:fs/promises';
import { basename, join } from 'pathe';
import puppeteer, {
	type Browser,
	type ElementHandle,
	type Page,
} from 'puppeteer';
import { preview, type PreviewServer } from 'vite';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

const port = 3000;
const indexURL = `http://localhost:${port}/dist/index.js`;
const assetsBaseURL = `http://localhost:${port}/test/assets`;

const corsPort = 3001;
const corsAssetsBaseURL = `http://localhost:${corsPort}/test/assets`;

function parseHTML(str: string) {
	return {
		styleCode: `${
			str.match(/<style>(.*)<\/style>/s)?.[1]!
				.replaceAll('__BASE_URL__', assetsBaseURL)
				.replaceAll('__CORS_BASE_URL__', corsAssetsBaseURL) ??
				''
		}
  * { box-sizing: border-box; }
`,
		templateCode: (
			str.match(/<template.*?>(.*)<\/template>/s)?.[1] ??
				'<div id="root"></div>'
		)
			.replaceAll('__BASE_URL__', assetsBaseURL)
			.replaceAll('__CORS_BASE_URL__', corsAssetsBaseURL),
		scriptCode: str.match(/<script.*?>(.*)<\/script>/s)?.[1]?.replace(
			'export default ',
			'return ',
		) ??
			"return window.modernScreenshot.domToPng(document.querySelector('body > *'))",
		skipExpect: Boolean(str.match(/<skip-expect.*\/>/s)?.[0]),
		debug: Boolean(str.match(/<debug.*\/>/s)?.[0]),
	};
}

const fixturesDir = join(__dirname, 'fixtures');

describe('dom to image in browser', async () => {
	let server: PreviewServer;
	let corsServer: PreviewServer;
	let browser: Browser;
	let page: Page;
	let body: ElementHandle<HTMLBodyElement>;
	let style: ElementHandle<HTMLStyleElement>;

	const fixtures = await Promise.all(
		glob.sync(join(fixturesDir, '*.html'))
			.map(async (path) => {
				return {
					path,
					...parseHTML(await readFile(path, 'utf8')),
				};
			}),
	);
	const debug = fixtures.some((fixture) => fixture.debug);

	beforeAll(async () => {
		server = await preview({
			build: { outDir: join(__dirname, '..') },
			preview: { port },
		});
		corsServer = await preview({
			build: { outDir: join(__dirname, '..') },
			preview: { port: corsPort },
		});
		browser = await puppeteer.launch({
			headless: !debug,
			devtools: debug,
		});
		page = await browser.newPage();
		await page.setContent(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Puppeteer Vitest Test Page</title>
  <style id="style"></style>
  <script src="${indexURL}"></script>
</head>
<body></body>
</html>`);
		body = (await page.$('body'))!;
		style = (await page.$('#style'))! as any;
	});

	afterAll(async () => {
		await browser.close();
		await new Promise<void>((resolve, reject) => {
			server.httpServer.close((error) => error ? reject(error) : resolve());
		});
		await new Promise<void>((resolve, reject) => {
			corsServer.httpServer.close((error) => error ? reject(error) : resolve());
		});
	});

	expect.extend({ toMatchImageSnapshot });

	for (
		const { path, scriptCode, styleCode, templateCode, skipExpect, debug }
			of fixtures
	) {
		const name = basename(path).replace('.html', '');
		test(name, async () => {
			await style.evaluate((el, val) => {
				el.innerHTML = val;
			}, styleCode);
			await body.evaluate((el, val) => {
				el.innerHTML = val;
			}, templateCode);
			const png = await page.evaluate(
				// eslint-disable-next-line no-new-func, @typescript-eslint/no-implied-eval -- needed
				(val) => new Function(val)(),
				scriptCode,
			);
			if (debug) {
				await new Promise((resolve) => {
					setTimeout(resolve, 60_000);
				});
			}

			const base64 = png.replace('data:image/png;base64,', '');
			const buffer = Buffer.from(base64, 'base64');
			const options = {
				customSnapshotIdentifier: name,
				customSnapshotsDir: fixturesDir,
			};
			try {
				expect(buffer).toMatchImageSnapshot(options);
			} catch {
				if (!skipExpect) {
					// eslint-disable-next-line no-console -- used for debugging
					console.log(png);
					expect(buffer).toMatchImageSnapshot(options);
				} else {
					expect(base64).not.toBe('');
				}
			}
		});
	}
});
