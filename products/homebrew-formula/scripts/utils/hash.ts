import { packageDirpaths } from '@-/packages-config';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import { hashFile } from 'hasha';
import path from 'pathe';

const { version } =
	tunnelPublicPackagesMetadata['@tunnel/cli-single-executable-application'];

export async function getSha256Hash(targetString: string) {
	return hashFile(
		path.join(
			packageDirpaths.cliSingleExecutableApplication,
			'targets',
			targetString,
			`.build/tunnel-cli-single-executable-application-${targetString}-${version}.tgz`,
		),
		{ algorithm: 'sha256' },
	);
}
