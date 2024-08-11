#!/usr/bin/env tsx

import { lint } from '#utils/lint.ts';

const { exitCode } = await lint({ fix: process.argv.includes('--fix') });
process.exit(exitCode);
