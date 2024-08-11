#!/usr/bin/env tsx

import { cli } from '@-/cli-helpers';
import { packageDirpaths } from '@-/packages-config';
import { servicesConfig } from '@-/services-config';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import http from 'node:http';
import path from 'pathe';

const app = express();
app.use((request, response, next) => {
	if (request.headers['x-forwarded-proto'] === 'http') {
		response.redirect(301, `https://${request.hostname}${request.url}`);
		return;
	}

	next();
});
app.use(createProxyMiddleware({
	changeOrigin: false,
	secure: true,
	ws: true,
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We use `router` instead
	target: null!,
	router(request) {
		let hostname = request.hostname || request.headers.host;
		hostname = hostname?.split(':')[0];

		if (hostname === undefined) {
			return;
		}

		if (
			hostname === 'tunnel.test' ||
			hostname === 'www.tunnel.test' ||
			hostname === 'tunneldev.test' ||
			hostname === 'www.tunneldev.test'
		) {
			return `http://127.0.0.1:${servicesConfig.webapp.httpPort}`;
		} else if (hostname.endsWith('tunnelapp.test')) {
			return `http://127.0.0.1:${servicesConfig.localtunnelServer.port}`;
		} else if (hostname.endsWith('.tunneldev.test')) {
			// `.tunneldev.test` subdomains are used by our test apps
			// These apps are accessible through the proxy server started
			// by `test-apps/start`
			return `http://127.0.0.1:${servicesConfig.testAppsServer.port}`;
		} else {
			throw new Error(
				`Unknown .test URL: ${hostname}`,
			);
		}
	},
}));

const server = http.createServer(app);
server.listen(servicesConfig.localDevelopmentProxyServer.port);

const mprocsBinFilepath = path.join(
	packageDirpaths.localDevelopment,
	'node_modules/.bin/mprocs',
);
await cli.execa(
	mprocsBinFilepath,
	['--config', path.join(packageDirpaths.localDevelopment, 'mprocs.yaml')],
	{
		cwd: packageDirpaths.monorepo,
		stdio: 'inherit',
	},
);

process.exit(0);
