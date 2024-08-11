import * as dependenciesData from '#data/dependencies.ts';
import path from 'pathe';
import { getPkgxPrefix } from './prefix.ts';

export function getPkgxInstallDependenciesScript({
	dependenciesType,
}: {
	dependenciesType: keyof typeof dependenciesData;
}) {
	const dependencySpecifiers = dependenciesData[dependenciesType];

	return `pkgx ${
		Object.entries(dependencySpecifiers)
			.map(([specifier, version]) => `+${specifier}=${version}`)
			.join(' ')
	}`;
}

export function getPkgxInstallDependenciesScriptDocker({
	dependenciesType,
}: {
	dependenciesType: keyof typeof dependenciesData;
}) {
	const dependencySpecifiers = dependenciesData[dependenciesType];

	return `pkgx install ${
		Object.entries(dependencySpecifiers)
			.map(([specifier, version]) => `${specifier}=${version}`)
			.join(' ')
	}`;
}

export async function getPkgxDependencyDirpath({
	dependencyName,
	dependenciesType,
}: {
	dependencyName: string;
	dependenciesType: keyof typeof dependenciesData;
}) {
	const dependencyVersion = (dependenciesData[dependenciesType] as any)[
		dependencyName
	];

	return path.join(getPkgxPrefix(), dependencyName, `v${dependencyVersion}`);
}

export async function getPkgxDependencyBinFilepath({
	dependencyName,
	binRelativeFilepath,
}: {
	dependencyName: string;
	binRelativeFilepath: string;
}) {
	const version = (dependenciesData.pkgxDevelopmentDependencies as any)[
		dependencyName
	];

	return path.join(
		getPkgxPrefix(),
		dependencyName,
		`v${version}`,
		binRelativeFilepath,
	);
}
