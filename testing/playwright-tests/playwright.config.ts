import { defineConfig } from 'playwright/test';

export default defineConfig({
	use: {
		contextOptions: {
			ignoreHTTPSErrors: true,
		},
	},
	fullyParallel: true,
	expect: {
		timeout: 10_000,
	},
	// Large timeout to accommodate many tests running in parallel
	timeout: 120_000,
});
