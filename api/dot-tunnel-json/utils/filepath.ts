import { RELEASE } from '@-/env/app';
import fs from 'node:fs';
import path from 'pathe';

export function getLocalProjectDotTunnelJsonFilepath({
	localProjectRootDirpath,
}: {
	localProjectRootDirpath: string;
}) {
	return fs.existsSync(path.join(localProjectRootDirpath, '.git')) ?
		path.join(
			localProjectRootDirpath,
			'.git',
			RELEASE === 'production' ?
				'.tunnel.json' :
				`.tunnel.${RELEASE ?? 'development'}.json`,
		) :
		path.join(
			localProjectRootDirpath,
			RELEASE === 'production' ?
				'.tunnel.json' :
				`.tunnel.${RELEASE ?? 'development'}.json`,
		);
}
