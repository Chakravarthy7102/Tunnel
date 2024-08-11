import { getTunnelCliSourceDirpath } from '@-/cli-source/dirpath';
import { APP_ENV, RELEASE } from '@-/env/app';
import { packageDirpaths } from '@-/packages-config';
import { createStaticResourceGetter } from '@-/static-resource';
import { tunnelPublicPackagesMetadata } from '@-/tunnel-public-packages-metadata';
import type { FastifyReply, FastifyRequest } from 'fastify';
import path from 'pathe';

const getServiceWorkerJs = createStaticResourceGetter(
	APP_ENV === 'production' ?
		{
			appEnv: 'production',
			resourcePath: path.join(
				getTunnelCliSourceDirpath({
					release: RELEASE,
					version: tunnelPublicPackagesMetadata['@tunnel/cli-source'].version,
				}),
				'tunnel-instance-page-service-worker/sw.js',
			),
		} :
		{
			appEnv: 'development',
			resourcePath: path.join(
				packageDirpaths.tunnelInstancePageServiceWorker,
				'.build/sw.js',
			),
			async build() {
				try {
					const unbuildString = '@-/unbuild';
					const { build, buildPreset } = (await import(
						unbuildString
					)) as typeof import('@-/unbuild');
					await build(
						packageDirpaths.tunnelInstancePageServiceWorker,
						false,
						buildPreset({
							release: null,
							version: '0.0.0',
							appEnv: 'development',
						}),
					);
				} catch (error: any) {
					// eslint-disable-next-line no-console -- todo
					console.error('Error building __tunnel-service-worker.js:', error);
				}
			},
		},
);

export const enabled = process.env.NODE_ENV !== 'production';

export async function GET(request: FastifyRequest, reply: FastifyReply) {
	const swjs = await getServiceWorkerJs();
	return reply
		.type('text/javascript')
		.send(
			swjs.replaceAll(
				'__SERVICE_WORKER_ORIGIN_HOSTNAME__',
				JSON.stringify(request.headers.origin),
			),
		);
}
