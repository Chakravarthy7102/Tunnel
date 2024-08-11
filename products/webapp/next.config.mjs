// @ts-check

import { RELEASE } from '@-/env/app';
import { createNextConfig } from '@-/next-config';
import { dirname } from 'desm';

process.on('uncaughtException', (error) => {
	console.error('Uncaught exception from next.config.js:', error);
});

process.on('unhandledRejection', (error) => {
	console.error('Unhandled rejection from next.config.js:', error);
});

/** @type {import('next').NextConfig} */
const nextConfig = {
	async rewrites() {
		return [
			{
				source: '/__tunnel/set-global-tunneled-service-environment-data.js',
				destination: `https://${
					RELEASE === 'production' ? 'tunnelapp' : 'staging.tunnelapp'
				}.dev/__tunnel/set-global-tunneled-service-environment-data.js`,
			},
			...(RELEASE === null ?
				[
					{
						source: '/ingest/static/:path*',
						destination: 'https://us-assets.i.posthog.com/static/:path*',
					},
					{
						source: '/ingest/:path*',
						destination: 'https://us.i.posthog.com/:path*',
					},
				] :
				[]),
		];
	},
	async redirects() {
		return [
			{
				source: '/support',
				destination: 'https://discord.gg/zMw6ZF2qCf',
				permanent: false,
			},
		];
	},
};

export default createNextConfig(
	dirname(import.meta.url),
	nextConfig,
);
