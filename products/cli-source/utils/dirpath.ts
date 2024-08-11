import { getDotTunnelDirpathSync } from '@-/dot-tunnel-directory';
import type { Release } from '@tunnel/release';
import { getMonorepoDirpath } from 'get-monorepo-root';
import path from 'pathe';

export function getTunnelCliSourceDirpath({
	release,
	version,
}: {
	release: Release;
	version: string;
}) {
	if (release === null) {
		const monorepoDirpath = getMonorepoDirpath(import.meta.url);
		if (monorepoDirpath === undefined) {
			throw new Error('Could not find monorepo root directory.');
		}

		return path.join(monorepoDirpath, 'products/cli-source/.build');
	} else {
		return path.join(getDotTunnelDirpathSync(), 'cli-source', version);
	}
}
