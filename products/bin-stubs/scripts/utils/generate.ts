import * as binStubs from '#stubs/_.ts';
import { packageDirpaths } from '@-/packages-config';
import fs from 'node:fs';
import path from 'pathe';

export async function generateBinStubs(
	args:
		| { release: null; monorepoDirpath: string }
		| { release: 'staging' | 'production'; tunnelCliSourceDirpath: string },
) {
	const generatedStubsDirpath = path.join(
		packageDirpaths.binStubs,
		'generated/__stubs__',
	);

	if (!fs.existsSync(generatedStubsDirpath)) {
		await fs.promises.mkdir(generatedStubsDirpath, { recursive: true });
	}

	await Promise.all(
		Object.values(binStubs).map(async ({ commandName, getStub }) => {
			const stubFilepath = path.join(generatedStubsDirpath, commandName);
			await fs.promises.writeFile(stubFilepath, await getStub(args));
			await fs.promises.chmod(stubFilepath, 0o755);
		}),
	);
}
