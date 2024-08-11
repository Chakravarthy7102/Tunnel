#!/usr/bin/env tsx

import { createMkcertCerts } from '#utils/mkcert.ts';
import { cli } from '@-/cli-helpers';
import { logger } from '@-/logger';
import { packageDirpaths } from '@-/packages-config';
import { servicesConfig } from '@-/services-config';
import express from 'express';
import fkill from 'fkill';
import { createProxyMiddleware } from 'http-proxy-middleware';
import ky from 'ky';
import http from 'node:http';
import https from 'node:https';
import { pEvent } from 'p-event';
import path from 'pathe';

// Start coredns
void cli.coredns([
	'-conf',
	path.join(packageDirpaths.localDevelopment, 'data/corefile'),
], { stdio: 'inherit' });

async function startProxy() {
	const app = express();
	app.use(createProxyMiddleware({
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

			if (
				hostname === 'tunnel.test' ||
				hostname.endsWith('.tunnel.test') ||
				hostname === 'tunnelapp.test' ||
				hostname.endsWith('tunnelapp.test')
			) {
				return `http://${hostname}:${servicesConfig.localDevelopmentProxyServer.port}`;
			} else if (
				hostname === 'tunneldev.test' ||
				hostname.endsWith('.tunneldev.test')
			) {
				return `http://${hostname}:${servicesConfig.testAppsServer.port}`;
			} else {
				throw new Error(
					`Unknown .test URL: ${hostname}`,
				);
			}
		},
	}));

	const { ca, cert, key } = await createMkcertCerts({
		localDomains: [
			'healthcheck.test',
			'tunnel.test',
			'*.tunnel.test',
			'tunnelapp.test',
			'*.tunnelapp.test',
			'tunneldev.test',
			'*.tunneldev.test',
		],
	});

	const httpServer = http.createServer((request, response) => {
		// Redirect to HTTPS
		response.statusCode = 301;
		response.statusMessage = 'Moved Permanently';
		response.setHeader(
			'Location',
			`https://${request.headers.host}${request.url}`,
		);
		response.end();
	});
	const httpsServer = https.createServer({ ca, cert, key });
	httpsServer.on('request', app);
	try {
		httpServer.listen(80);
		await pEvent(httpServer, 'listening');
	} catch {
		let isProxyServerHealthy: boolean;
		try {
			const response = await ky.get('http://healthcheck.test', {
				timeout: 500,
			});
			isProxyServerHealthy = await response.text() === 'OK';
		} catch {
			isProxyServerHealthy = false;
		}

		if (isProxyServerHealthy) {
			logger.info('Proxy server is already running on port 80/443');
		} else {
			await fkill(':80', { force: true, silent: true });
			await fkill(':443', { force: true, silent: true });
			httpServer.listen(80);
			httpsServer.listen(443);
			logger.info('Proxy server started on ports 80/443');
			return;
		}
	}

	httpsServer.listen(443);

	logger.info('Proxy server started on ports 80/443');
}

await startProxy();
