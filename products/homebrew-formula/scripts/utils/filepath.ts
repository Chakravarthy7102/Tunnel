import { packageDirpaths } from '@-/packages-config';
import path from 'pathe';

export function getTunnelBinFilepath(targetString: string) {
	return path.join(
		packageDirpaths.cliSingleExecutableApplication,
		'targets',
		targetString,
		'.build/tunnel',
	);
}
