const { deepmerge } = require('deepmerge-ts');
const { env } = require('@-/env');
const webpackBootstrappers = require('./webpack/bootstrappers/index.js');
const { withBundleAnalyzer } = require('./webpack/utils/bundle-analyzer.js');

function createNextConfig(dirname, configToMerge) {
	return function nextConfig(phase) {
		let config = deepmerge(
			{
				compiler: {
					styledComponents: true,
				},
				images: {
					remotePatterns: [
						{
							protocol: 'https',
							hostname: '**',
						},
					],
				},
				reactStrictMode: true,
				swcMinify: true,
				typescript: {
					ignoreBuildErrors: true,
					tsconfigPath: '../../tsconfig.json',
				},
				eslint: {
					ignoreDuringBuilds: true,
				},
				webpack(config, context) {
					Object.defineProperty(context, 'isClient', {
						value: !context.isServer,
					});
					Object.defineProperty(context, 'phase', { value: phase });

					const runBootstrapper = (bootstrapper) =>
						// @ts-expect-error: TypeScript doesn't know we assign `isClient`
						bootstrapper(config, context);

					for (const bootstrapper of webpackBootstrappers) {
						runBootstrapper(bootstrapper);
					}

					/** @see https://github.com/vercel/next.js/discussions/32237#discussioncomment-4793595 */
					config.resolve.extensionAlias = {
						'.js': ['.ts', '.tsx', '.js'],
					};

					return config;
				},
			},
			configToMerge,
		);

		config = withBundleAnalyzer(config);

		return config;
	};
}

module.exports = { createNextConfig };
