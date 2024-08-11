import { cli } from '@-/cli-helpers';
import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import fs from 'node:fs';
import path from 'pathe';
import { getApp } from './app.ts';

export async function runTestService(
	{
		appRepo,
		servicesConfig,
		serviceSlug,
	}: {
		appRepo: string;
		servicesConfig: Record<string, { port: number }>;
		serviceSlug: string | null;
	},
) {
	if (serviceSlug === null) {
		throw new Error(
			'Service slug is required (we will support running all services later)',
		);
	}

	const app = await getApp(appRepo, { servicesConfig });

	const service = app.services[serviceSlug];
	if (service === undefined) {
		throw new Error(`Service "${serviceSlug}" not found`);
	}

	const serviceConfig = servicesConfig[serviceSlug];
	if (serviceConfig === undefined) {
		throw new Error(`Config for service "${serviceSlug}" not found`);
	}

	const { dockerfile, dockerPort } = service;

	// We write the generated Dockerfile to the filesystem to help with debugging
	const dockerfilePath = path.join(
		packageDirpaths.testApps,
		'generated',
		appRepo,
		`${serviceSlug}.dockerfile`,
	);
	await fs.promises.mkdir(path.dirname(dockerfilePath), {
		recursive: true,
	});
	await fs.promises.writeFile(dockerfilePath, dockerfile);

	const tag = `${appRepo}_${serviceSlug}`;
	const repoOwner = appRepo.split('/')[0];

	await Promise.all(
		Object.entries(service.submodules).map(
			async ([submodulePath, submoduleRepo]) => {
				const submoduleDirpath = path.join(
					packageDirpaths.monorepo,
					'repos',
					appRepo,
					submodulePath,
				);

				if (
					!fs.existsSync(submoduleDirpath) ||
					(await fs.promises.readdir(submoduleDirpath)).length === 0
				) {
					logger.info(`Copying submodule ${submoduleRepo} into ${appRepo}...`);
					const submoduleRepoDirpath = path.join(
						packageDirpaths.monorepo,
						'repos',
						submoduleRepo,
					);
					await fs.promises.mkdir(submoduleDirpath, { recursive: true });

					await Promise.all(
						(await fs.promises.readdir(submoduleRepoDirpath)).map(
							async (filename) => {
								if (filename === '.git') {
									return;
								}

								await fs.promises.cp(
									path.join(submoduleRepoDirpath, filename),
									path.join(submoduleDirpath, filename),
									{ recursive: true },
								);
							},
						),
					);
				}
			},
		),
	);

	await cli.docker([
		'build',
		'-f',
		'-',
		'-t',
		tag,
		path.join(packageDirpaths.monorepo, 'repos', appRepo),
	], {
		input: dockerfile,
		stdout: 'inherit',
		stderr: 'inherit',
	});

	const containerName = `${repoOwner}_${serviceSlug}`;

	// Remove any existing containers
	await cli.docker([
		'rm',
		'-f',
		containerName,
	], { stdio: 'inherit', reject: false });

	return {
		process: cli.docker([
			'run',
			...Object.entries(service.environment).flatMap((
				[key, value],
			) => [
				'-e',
				`${key}=${value}`,
			]),
			'-p',
			`${serviceConfig.port}:${dockerPort}`,
			'--name',
			containerName,
			tag,
		], { stdio: 'inherit' }),
		port: serviceConfig.port,
	};
}
