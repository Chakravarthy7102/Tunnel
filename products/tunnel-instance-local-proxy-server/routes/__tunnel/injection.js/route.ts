import { packageDirpaths } from '@-/packages-config';
import { createStaticResourceGetter } from '@-/static-resource';
import type { FastifyReply, FastifyRequest } from 'fastify';
import path from 'pathe';

const getInjectionJs = createStaticResourceGetter({
	appEnv: 'development',
	resourcePath: path.join(
		packageDirpaths.tunneledServiceWindowInjection,
		'.build/injection.js',
	),
	async build() {
		try {
			const unbuildString = '@-/unbuild';
			const { build, buildPreset } = (await import(
				unbuildString
			)) as typeof import('@-/unbuild');
			await build(
				packageDirpaths.tunneledServiceWindowInjection,
				false,
				buildPreset({
					release: null,
					version: '0.0.0',
					appEnv: 'development',
				}),
			);
		} catch (error: any) {
			// eslint-disable-next-line no-console -- todo
			console.error('Error building injection.js:', error);
		}
	},
});

export const enabled = process.env.NODE_ENV !== 'production';

export async function GET(request: FastifyRequest, reply: FastifyReply) {
	return reply.type('text/javascript').send(await getInjectionJs());
}
