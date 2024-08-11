#!/usr/bin/env tsx

import { servicesConfig } from '@-/services-config';
import pWaitFor from 'p-wait-for';

export async function waitForServerHealthy() {
	const port = servicesConfig.webapp.httpPort;

	await pWaitFor(
		async () => {
			try {
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- broken types
				const response = await fetch(
					`http://127.0.0.1:${port}/api/health`,
				);
				const text = await response.text();
				return text === 'OK';
			} catch {
				return false;
			}
		},
		{ interval: 1000 },
	);
}
