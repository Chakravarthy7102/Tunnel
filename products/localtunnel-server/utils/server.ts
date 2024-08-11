import ClientManager from '#classes/client-manager.ts';
import { APP_ENV } from '@-/env/app';
import fastifyCookie from '@fastify/cookie';
import fastifyProxy from '@fastify/http-proxy';
import fastify from 'fastify';
import http from 'node:http';
import tldjs from 'tldjs';

export function createServer(opt: any) {
	opt ||= {};

	const validHosts = (opt.domain) ? [opt.domain] : undefined;
	const myTldjs = tldjs.fromUserSettings({ validHosts });
	const landingPage = opt.landing ||
		(APP_ENV === 'development' ? 'https://tunnel.test' : 'https://tunnel.dev');

	function GetClientIdFromHostname(hostname: any) {
		return myTldjs.getSubdomain(hostname);
	}

	const manager = new ClientManager(opt);
	const server = http.createServer();

	const app = fastify({
		serverFactory(handler) {
			server.on('request', (request, response) => {
				// without a hostname, we won't know who the request is for
				const hostname = APP_ENV === 'development' ?
					request.headers['x-forwarded-host']?.toString() ??
						request.headers.host?.toString() :
					request.headers.host?.toString();

				if (!hostname) {
					response.statusCode = 400;
					response.end('Host header is required');
					return;
				}

				if (request.headers['x-forwarded-proto'] === 'http') {
					response.write(`301: https://${hostname}${request.url}`);
					return;
				}

				if (
					request.url?.startsWith('/__tunnel') &&
					// This route is handled by the local proxy server
					request.url !==
						'/__tunnel/set-global-tunneled-service-environment-data.js'
				) {
					void handler(request, response);
					return;
				}

				const clientId = GetClientIdFromHostname(hostname);
				if (!clientId) {
					void handler(request, response);
					return;
				}

				const client = manager.getClient(clientId);
				if (!client) {
					response.statusCode = 404;
					response.end('404');
					return;
				}

				client.handleRequest(request, response);
			});

			server.on('upgrade', (request, socket) => {
				const hostname = request.headers.host;
				if (!hostname) {
					socket.destroy();
					return;
				}

				const clientId = GetClientIdFromHostname(hostname);
				if (!clientId) {
					socket.destroy();
					return;
				}

				const client = manager.getClient(clientId);
				if (!client) {
					socket.destroy();
					return;
				}

				client.handleUpgrade(request, socket);
			});

			return server;
		},
	});

	void app.register(fastifyCookie);

	// For backwards-compability with `tunnelapp.dev` domains from old `<script>` tags
	app.get('/__tunnel/script.js', async (request, reply) => {
		return reply.redirect(
			`https://${
				request.hostname.replace('tunnelapp', 'tunnel')
			}/__tunnel/script.js`,
		);
	});

	const upstream = APP_ENV === 'development' ?
		'https://tunnel.test' :
		'https://tunnel.dev';

	void app.register(fastifyProxy, {
		upstream,
		prefix: '/__tunnel/api/authenticate',
		rewritePrefix: '/__tunnel/api/authenticate',
		http2: false,
	});
	void app.register(fastifyProxy, {
		upstream,
		prefix: '/__tunnel/api/set-cookies',
		rewritePrefix: '/__tunnel/api/set-cookies',
		http2: false,
	});
	void app.register(fastifyProxy, {
		upstream,
		prefix: '/__tunnel/api/unauthenticate',
		rewritePrefix: '/__tunnel/api/unauthenticate',
		http2: false,
	});
	// This route is used when a user visits a live preview that originated from the use of the wrapper command
	void app.register(fastifyProxy, {
		upstream,
		prefix: '/__tunnel/set-global-tunneled-service-environment-data.js',
		rewritePrefix: '/__tunnel/set-global-tunneled-service-environment-data.js',
		http2: false,
	});

	// root endpoint
	app.addHook('onRequest', async (request, reply) => {
		if (request.url === '/') {
			return reply.redirect(landingPage);
		}

		const parts = request.url.split('/');

		// any request with several layers of paths is not allowed
		// rejects /foo/bar
		// allow /foo
		if (parts.length !== 2) {
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- todo
		const reqId = parts[1]!;

		// limit requested hostnames to 63 characters
		if (!/^(?:[\da-z][\da-z-]{4,63}[\da-z]|[\da-z]{4,63})$/.test(reqId)) {
			const msg =
				'Invalid subdomain. Subdomains must be lowercase and between 4 and 63 alphanumeric characters.';
			return reply.status(403).send(msg);
		}

		const info: any = await manager.newClient(reqId);

		const url = 'https://' + info.id + '.' + request.hostname;
		info.url = url;
		return reply.send(info);
	});

	return app;
}
