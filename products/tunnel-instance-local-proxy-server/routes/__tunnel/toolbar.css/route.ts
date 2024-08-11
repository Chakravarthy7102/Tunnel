import { packageDirpaths } from '@-/packages-config';
import { createStaticResourceGetter } from '@-/static-resource';
import type { FastifyReply, FastifyRequest } from 'fastify';
import path from 'pathe';

const getToolbarCss = createStaticResourceGetter({
	appEnv: 'development',
	resourcePath: path.join(
		packageDirpaths.tunnelInstancePageToolbar,
		'.build/toolbar.css',
	),
	async build() {},
});

export const enabled = process.env.NODE_ENV !== 'production';

export async function GET(request: FastifyRequest, reply: FastifyReply) {
	return reply.type('text/css').send(await getToolbarCss());
}
