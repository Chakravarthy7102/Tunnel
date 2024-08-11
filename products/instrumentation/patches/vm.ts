import { getInstrumentedCode } from '#utils/instrument.ts';
import { RELEASE } from '@-/env/app';
import type { LocalProjectEnvironment } from '@-/local-project';
import { packageDirpaths } from '@-/packages-config';
import type { TunnelYamlConfig } from '@-/tunnel-yaml-config';
import { dirname } from 'dyrname';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'pathe';

const tunnelPatchedVmSymbol = Symbol('tunnel-patched-vm');

const fs_readFileSync = fs.readFileSync;

/**
	We need to patch `fs.readFileSync` because Vercel edge functions use it to run compiled code in the `.next` directory.
*/
export function patchNodeVmMethods({
	localProjectEnvironment,
	tunnelYamlConfig,
}: {
	localProjectEnvironment: LocalProjectEnvironment;
	tunnelYamlConfig: TunnelYamlConfig;
}) {
	// @ts-expect-error: Custom property
	if (vm[tunnelPatchedVmSymbol] === true) {
		return;
	}

	// buggy
	return;

	// @ts-expect-error: Custom property
	vm[tunnelPatchedVmSymbol] = true;

	const tnlJsPath = RELEASE === null ?
		path.join(packageDirpaths.instrumentation, '.build/tnl.js') :
		dirname();

	const { runInContext } = vm;
	vm.runInContext = (code, contextifiedObject, options) => {
		if (!Object.hasOwn(contextifiedObject, 'TNL__')) {
			Object.defineProperty(contextifiedObject, 'TNL__', {
				value: (globalThis as any).TNL__,
				enumerable: false,
			});
		}

		return runInContext(
			getInstrumentedCode({
				code: code.toString(),
				filepath:
					typeof options === 'object' && typeof options.filename === 'string' ?
						options.filename :
						'',
				inEval: false,
				sourceType: 'module',
				inlineTnl: {
					source: fs_readFileSync(tnlJsPath, 'utf8'),
				},
				localProjectEnvironment,
				tunnelYamlConfig,
			}),
			contextifiedObject,
			options,
		);
	};
}
