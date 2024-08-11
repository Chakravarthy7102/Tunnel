import convertHrtime from 'convert-hrtime';
import type { EventEmitter } from 'node:stream';
import type { Page } from 'playwright';

/**
	Creates a new viewer for the new tunnel
*/
export async function createTunnelViewer(
	page: Page,
	vuContext: unknown,
	events: EventEmitter,
) {
	const start = process.hrtime.bigint();
	await page.goto('https://load-testing.staging.tunnelapp.dev');
	await page.waitForLoadState('networkidle', { timeout: 300 * 60 });
	const end = process.hrtime.bigint();

	events.emit(
		'histogram',
		'load-time',
		convertHrtime(end - start).milliseconds,
	);
}
