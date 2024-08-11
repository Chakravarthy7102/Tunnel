import { pkgx } from '#cli/pkgx.ts';
import { packageDirpaths } from '@-/packages-config';
import { pkgxDevelopmentDependencies } from '@-/pkgx';

export const createPkgxInstall =
	(packageName: keyof typeof pkgxDevelopmentDependencies) => async () => {
		await pkgx(
			[`+${packageName}=${pkgxDevelopmentDependencies[packageName]}`],
			{
				stdio: 'inherit',
				cwd: packageDirpaths.monorepo,
			},
		);
	};
