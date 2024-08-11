#!/usr/bin/env tsx

import { getUserData } from '#stacks/localtunnel-server/data/user-data.ts';
import clipboard from 'clipboardy';

clipboard.writeSync(getUserData());
process.stdout.write('Copied to clipboard!\n');
