import { cli } from '@-/cli-helpers';
import fs from 'node:fs';
import os from 'node:os';
import onetime from 'onetime';
import path from 'pathe';

export const getMkcertCertsDirpath = onetime(async () => {
	const mkcertCertsDirpath = path.join(os.homedir(), '.mkcert');
	await fs.promises.mkdir(mkcertCertsDirpath, { recursive: true });
	return mkcertCertsDirpath;
});

export const getMkcertCertsPaths = onetime(async () => {
	const { stdout: caRootDir } = await cli.mkcert(['-CAROOT']);
	const mkcertCertsDir = await getMkcertCertsDirpath();

	return {
		caFilepath: path.join(caRootDir, 'rootCA.pem'),
		keyFilepath: path.join(mkcertCertsDir, 'test-key.pem'),
		certFilepath: path.join(mkcertCertsDir, 'test-cert.pem'),
	};
});

/**
	A utility function to creates locally-trusted development certificates using mkcert

	@param localDomains - A list of local domains to create certificates for (these domains should end in `.test`)

	@see https://github.com/FiloSottile/mkcert
*/
export async function createMkcertCerts({
	localDomains,
}: {
	localDomains: string[];
}) {
	const keyFileName = 'test-key.pem';
	const certFileName = 'test-cert.pem';
	const mkcertCertsDirpath = await getMkcertCertsDirpath();

	await cli.mkcert(['-install']);
	await cli.mkcert(
		['-key-file', keyFileName, '-cert-file', certFileName, ...localDomains],
		{ cwd: mkcertCertsDirpath },
	);

	const { caFilepath, keyFilepath, certFilepath } = await getMkcertCertsPaths();
	const [key, cert, ca] = await Promise.all([
		fs.promises.readFile(keyFilepath, 'utf8'),
		fs.promises.readFile(certFilepath, 'utf8'),
		fs.promises.readFile(caFilepath, 'utf8'),
	]);

	return {
		ca,
		key,
		cert,
	};
}
