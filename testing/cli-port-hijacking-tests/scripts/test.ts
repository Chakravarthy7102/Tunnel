#!/usr/bin/env tsx

import { testDemoProject } from '#utils/browser.ts';
import { demoProjectConfigs } from '@-/demo-projects';

const cra = demoProjectConfigs['create-react-app'];
await testDemoProject({ demoProjectConfig: cra });

process.exit(1);

// for (const demoProjectConfig of Object.values(demoProjectConfigs)) {
// 	await testDemoProject({ demoProjectConfig });
// }
