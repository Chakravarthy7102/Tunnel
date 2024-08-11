import { packageDirpaths } from '@-/packages-config';
import { createStaticResourceGetter } from '@-/static-resource';
import type { FastifyReply, FastifyRequest } from 'fastify';
import path from 'pathe';

const getToolbarGlobalCss = createStaticResourceGetter({
	appEnv: 'development',
	resourcePath: path.join(
		packageDirpaths.tunnelInstancePageToolbar,
		'.build/toolbar.global.css',
	),
	async build() {
		const tunnelInstancePageToolbarScriptsString =
			'@-/tunnel-instance-page-toolbar/scripts';
		const { buildTunnelInstancePageToolbarGlobalCss } = await import(
			tunnelInstancePageToolbarScriptsString
		);
		try {
			await buildTunnelInstancePageToolbarGlobalCss({
				release: null,
				compressResources: false,
			});
		} catch (error: any) {
			// eslint-disable-next-line no-console -- todo
			console.error('Error building toolbar.global.css:', error);
		}
	},
});

export const enabled = process.env.NODE_ENV !== 'production';

export async function GET(request: FastifyRequest, reply: FastifyReply) {
	return reply.type('text/css').send(await getToolbarGlobalCss());
}
