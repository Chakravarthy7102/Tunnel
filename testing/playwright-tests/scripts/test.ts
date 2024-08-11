#!/usr/bin/env tsx

import { runPlaywrightTests } from './utils/test.ts';

await runPlaywrightTests({ appEnv: 'development' });
