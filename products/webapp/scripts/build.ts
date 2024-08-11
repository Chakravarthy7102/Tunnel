#!/usr/bin/env tsx

import { logger } from '@-/logger';
import { buildWebapp } from './utils/build.ts';

if (!process.env.CONVEX_URL) {
	throw new Error(
		"Missing `CONVEX_URL` in environment (make sure to use `convex deploy --cmd 'pnpm build'; ",
	);
}

await buildWebapp({
	appEnv: 'production',
	release: process.argv.includes('--development') ?
		null :
		process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF === 'release' ?
		'production' :
		'staging',
	convexUrl: process.env.CONVEX_URL,
});

logger.info('Finished building webapp!');
process.exit(0);
