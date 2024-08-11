import {
	patchChildProcessMethods,
	patchNodeFsMethods,
	patchNodeProcessMethods,
	patchNodeVmMethods,
} from '@-/instrumentation/patches';
import { isFileEsmSync } from 'is-file-esm-ts';
import path from 'pathe';

// Remove the stdin (\`-\`) argument
process.argv.splice(1, 1);

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- Guaranteed to be defined
const entryFilepath = path.resolve(process.cwd(), process.argv[1]!);
const localProjectEnvironment =
	process.env.TUNNEL_LOCAL_PROJECT_ENVIRONMENT === undefined ?
		undefined :
		// eslint-disable-next-line no-restricted-properties -- Parsing an env variable
		JSON.parse(process.env.TUNNEL_LOCAL_PROJECT_ENVIRONMENT);

const tunnelYamlConfig = process.env.TUNNEL_YAML_CONFIG === undefined ?
	undefined :
	// eslint-disable-next-line no-restricted-properties -- Parsing an env variable
	JSON.parse(process.env.TUNNEL_YAML_CONFIG);

if (localProjectEnvironment !== undefined) {
	patchNodeFsMethods({ localProjectEnvironment });
	patchNodeProcessMethods({ localProjectEnvironment });
	patchChildProcessMethods({ localProjectEnvironment });

	if (tunnelYamlConfig !== undefined) {
		patchNodeVmMethods({
			localProjectEnvironment,
			tunnelYamlConfig,
		});
	}
}

let isFileEsm;
try {
	isFileEsm = isFileEsmSync(entryFilepath);
} catch {
	isFileEsm = false;
}

if (isFileEsm) {
	import(entryFilepath);
} else {
	require(entryFilepath);
}
