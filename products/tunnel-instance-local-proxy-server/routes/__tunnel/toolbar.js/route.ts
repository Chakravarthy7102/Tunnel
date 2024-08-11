import { packageDirpaths } from '@-/packages-config';
import { createStaticResourceGetter } from '@-/static-resource';
import type { FastifyReply, FastifyRequest } from 'fastify';
import path from 'pathe';

const getToolbarJs = createStaticResourceGetter({
	appEnv: 'development',
	resourcePath: path.join(
		packageDirpaths.tunnelInstancePageToolbar,
		'.build/toolbar.js',
	),
	async build() {
		try {
			const unbuildString = '@-/unbuild';
			const { build, buildPreset, isWatchMode } = (await import(
				unbuildString
			)) as typeof import('@-/unbuild');
			if (!(await isWatchMode())) {
				await build(
					packageDirpaths.tunnelInstancePageToolbar,
					false,
					buildPreset({
						release: null,
						version: '0.0.0',
						appEnv: 'development',
					}),
				);
			}
		} catch (error: any) {
			// eslint-disable-next-line no-console -- todo
			console.error('Error building toolbar.js:', error);
		}
	},
});

export const enabled = process.env.NODE_ENV !== 'production';

export async function GET(request: FastifyRequest, reply: FastifyReply) {
	return reply.type('text/javascript').send(await getToolbarJs());
}
