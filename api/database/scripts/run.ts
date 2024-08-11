#!/usr/bin/env tsx

import { convex } from './utils/convex.ts';

await convex('run', process.argv.slice(2));
