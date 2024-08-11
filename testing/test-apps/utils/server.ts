import * as testAppDefinitions from '#apps/_.js';
import { packageDirpaths } from '@-/packages-config';
import { servicesConfig } from '@-/services-config';
import express from 'express';
import getPort from 'get-port';
import { createProxyMiddleware } from 'http-proxy-middleware';
import mapObject from 'map-obj';
import fs from 'node:fs';
import http from 'node:http';
import pProps from 'p-props';
import path from 'pathe';
import { getApp } from './app.ts';

export async function startTestAppsServer() {
	const testApps = await Promise.all(
		Object.values(testAppDefinitions).map(async (appDefinition) => {
			const servicesConfig = await pProps(
				appDefinition.serviceDeclarations,
				async () => ({
					port: await getPort(),
				}),
			);
			return getApp(appDefinition.repo, { servicesConfig });
		}),
	);

	// We should generate a port number for each service
	const testServices = Object.fromEntries(
		testApps.flatMap((testApp) =>
			Object.entries(testApp.services).map((
				[_slug, service],
			) => [service.subdomain, { ...service, app: testApp }] as const)
		),
	);

	// We generate the `mprocs.yaml` file for running all our services concurrently
	const mprocsYaml = JSON.stringify(
		{
			procs: {
				...mapObject(
					testServices,
					(subdomain, { appRepo, slug, app, publicPort }) => {
						return [
							`(${publicPort}) ${subdomain as string}`,
							`${
								path.join(packageDirpaths.testApps, 'scripts/run.ts')
							} ${appRepo} ${slug} --config=${
								JSON.stringify(JSON.stringify(app.servicesConfig))
							}`,
						];
					},
				),
				_: 'pnpm local-development/proxy',
			},
		},
		null,
		'\t',
	);
	await fs.promises.writeFile(
		path.join(packageDirpaths.testApps, 'generated/mprocs.yaml'),
		mprocsYaml,
	);

	const app = express();
	app.use((request, response, next) => {
		if (request.headers['x-forwarded-proto'] === 'http') {
			response.redirect(301, `https://${request.hostname}${request.url}`);
			return;
		}

		next();
	});
	app.use(createProxyMiddleware({
		/**
			We want apps to receive requests from a non-localhost domain (as many of them may be running using a production environment)
		*/
		changeOrigin: false,
		secure: true,
		ws: true,
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We use `router` instead
		target: null!,
		router(request) {
			const hostname = request.hostname || request.headers.host;

			if (hostname === undefined) {
				return;
			}

			if (hostname.endsWith('.tunneldev.test')) {
				const subdomain = hostname.replace(/\.tunneldev\.test/, '');
				const testService = testServices[subdomain];
				if (testService === undefined) {
					throw new Error(
						`Unknown .tunneldev.test subdomain: ${subdomain}`,
					);
				}

				return `http://127.0.0.1:${testService.publicPort}`;
			} else {
				throw new Error(
					`Unknown .test URL: ${hostname}`,
				);
			}
		},
	}));

	const server = http.createServer(app);
	server.listen(servicesConfig.testAppsServer.port);
}
