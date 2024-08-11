import { createServer } from '#utils/server.ts';
import { servicesConfig } from '@-/services-config';
import optimist from 'optimist';

const { argv } = optimist
	.usage('Usage: $0 --port [num]')
	.options('address', {
		default: '0.0.0.0',
		describe: 'IP address to bind to',
	})
	.options('max-sockets', {
		default: 10,
		describe:
			'maximum number of tcp sockets each client is allowed to establish at one time (the tunnels)',
	});

if (argv.help) {
	optimist.showHelp();
	process.exit();
}

const server = createServer({
	max_tcp_sockets: argv['max-sockets'],
	secure: true,
	domain: 'tunnelapp.dev',
});

server.listen(
	{ port: servicesConfig.localtunnelServer.port, host: '0.0.0.0' },
	() => {
		console.debug(
			'server listening on port: %d',
			servicesConfig.localtunnelServer.port,
		);
	},
);

process.on('SIGINT', () => {
	process.exit();
});

process.on('SIGTERM', () => {
	process.exit();
});

process.on('uncaughtException', (err) => {
	console.error(err);
});

process.on('unhandledRejection', (reason, _promise) => {
	console.error(reason);
});
