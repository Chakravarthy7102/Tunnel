import destr from 'destru';
import fs from 'node:fs';
import path from 'pathe';
import type { PackageJson } from 'type-fest';

const fs_readFileSync = fs.readFileSync;
const fs_promises_readFile = fs.promises.readFile;
const fs_existsSync = fs.existsSync;

export async function getPackageMetaFromFilepath(filepath: string) {
	const packageDirpath = getPackageDirpathFromFilepath(filepath);
	if (packageDirpath === null) {
		return null;
	}

	const packageJsonFilepath = path.join(packageDirpath, 'package.json');
	if (!fs_existsSync(packageJsonFilepath)) {
		return null;
	}

	const packageJson = destr(
		await fs_promises_readFile(packageJsonFilepath, 'utf8'),
	);

	if (typeof packageJson === 'string') {
		return null;
	}

	return getPackageMetaFromManifest({
		packageJson: packageJson as PackageJson,
		packageJsonFilepath,
	});
}

export function getPackageMetaFromFilepathSync(filepath: string) {
	const packageDirpath = getPackageDirpathFromFilepath(filepath);
	if (packageDirpath === null) {
		return null;
	}

	const packageJsonFilepath = path.join(packageDirpath, 'package.json');
	if (!fs_existsSync(packageJsonFilepath)) {
		return null;
	}

	const packageJson = destr(fs_readFileSync(packageJsonFilepath, 'utf8'));
	if (typeof packageJson === 'string') {
		return null;
	}

	return getPackageMetaFromManifest({
		packageJson: packageJson as PackageJson,
		packageJsonFilepath,
	});
}

export function getPackageMetaFromManifest({
	packageJson,
	packageJsonFilepath,
}: {
	packageJson: PackageJson;
	packageJsonFilepath: string;
}) {
	if (packageJson.name === undefined) {
		return null;
	}

	if (packageJson.version === undefined) {
		return null;
	}

	return {
		name: packageJson.name,
		version: packageJson.version,
		filepath: packageJsonFilepath,
	};
}

function getPackageDirpathFromFilepath(filepath: string) {
	const nodeModulesDirpath = getNodeModulesDirpathFromFilepath(filepath);
	const relativeFilepath = path.relative(nodeModulesDirpath, filepath);
	if (relativeFilepath.startsWith('.pnpm/')) {
		const packageRelativeDirpath = relativeFilepath.match(
			/^\.pnpm\/[^/]+\/node_modules\/[^/]+/,
		)?.[0];
		if (packageRelativeDirpath === undefined) {
			return null;
		}

		return path.join(nodeModulesDirpath, packageRelativeDirpath);
	} else {
		if (relativeFilepath.startsWith('@')) {
			const packageRelativeDirpath = relativeFilepath.match(/^@[^/]+\/[^/]+/)
				?.[0];
			if (packageRelativeDirpath === undefined) {
				return null;
			}

			return path.join(nodeModulesDirpath, packageRelativeDirpath);
		} else {
			return path.join(
				nodeModulesDirpath,
				relativeFilepath.slice(0, relativeFilepath.indexOf('/')),
			);
		}
	}
}

export function getNodeModulesDirpathFromFilepath(filepath: string) {
	const nodeModulesPartString = '/node_modules/';
	const nodeModulesIndex = filepath.indexOf(nodeModulesPartString);
	const nodeModulesDirpath = filepath.slice(
		0,
		nodeModulesIndex +
			nodeModulesPartString.length -
			// Exclude the ending `/`
			1,
	);

	return nodeModulesDirpath;
}
