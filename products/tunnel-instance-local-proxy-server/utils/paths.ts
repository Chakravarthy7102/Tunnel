import { APP_ENV } from '@-/env/app';
import { packageDirpaths, packageSlugs } from '@-/packages-config';
import { fileURLToPath } from 'node:url';
import onetime from 'onetime';
import pMemoize from 'p-memoize';
import path from 'pathe';
import { packageDirectory } from 'pkg-dir';
import invariant from 'tiny-invariant';

export const getDistNpmPackageDirpath = pMemoize(async () => {
	const distNpmPackageDirpath = await packageDirectory({
		cwd: fileURLToPath(import.meta.url),
	});
	invariant(
		distNpmPackageDirpath !== undefined,
		'@tunnel/cli should have a package.json file',
	);
	return distNpmPackageDirpath;
});

export const getPageToolbarDistDirpath = onetime(async () => {
	const distNpmPackageDirpath = await getDistNpmPackageDirpath();

	const pageToolbarDistDirpath = APP_ENV === 'development' ?
		path.join(packageDirpaths.tunnelInstancePageToolbar, '.build') :
		path.join(
			distNpmPackageDirpath,
			packageSlugs.tunnelInstancePageToolbar,
		);

	return pageToolbarDistDirpath;
});

export const getPageInjectionDistDirpath = onetime(async () => {
	const distNpmPackageDirpath = await getDistNpmPackageDirpath();

	const pageInjectionDistDirpath = APP_ENV === 'development' ?
		path.join(packageDirpaths.tunneledServiceWindowInjection, '.build') :
		path.join(
			distNpmPackageDirpath,
			packageSlugs.tunneledServiceWindowInjection,
		);

	return pageInjectionDistDirpath;
});

export const getPageScriptDistDirpath = onetime(async () => {
	return APP_ENV === 'development' ?
		path.join(packageDirpaths.tunnelInstancePageScript, '.build') :
		path.join(
			await getDistNpmPackageDirpath(),
			packageSlugs.tunnelInstancePageScript,
		);
});

export const getServiceWorkerDistDirpath = onetime(async () => {
	return APP_ENV === 'development' ?
		path.join(packageDirpaths.tunnelInstancePageServiceWorker, '.build') :
		path.join(
			await getDistNpmPackageDirpath(),
			packageSlugs.tunnelInstancePageServiceWorker,
		);
});
