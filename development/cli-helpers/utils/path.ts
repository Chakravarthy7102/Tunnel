import { getPkgxDependencyBinFilepath } from '@-/pkgx';
import isCi from 'is-ci';
import isDocker from 'is-docker';
import path from 'pathe';
import which from 'which';

export async function getExecutablePath({
	dependencyName,
	binRelativeFilepath,
}: {
	dependencyName: string;
	binRelativeFilepath: string;
}) {
	// We want to use the `pnpm` in the path if available (e.g. on GitHub Actions)
	const binFilepath = isCi || isDocker() ?
		await which(path.basename(binRelativeFilepath), { nothrow: true }) :
		null;

	return (
		binFilepath ??
			getPkgxDependencyBinFilepath({
				dependencyName,
				binRelativeFilepath,
			})
	);
}
