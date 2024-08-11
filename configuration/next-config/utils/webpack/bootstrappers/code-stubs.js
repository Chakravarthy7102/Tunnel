const path = require('pathe');

const { defineBootstrapper } = require('../utils/bootstrapper.js');
const { webappDirpath } = require('../utils/paths.js');

module.exports = defineBootstrapper((config, { webpack, isClient }) => {
	if (isClient) {
		const clientCodeStubsPlugin = new webpack.NormalModuleReplacementPlugin(
			/.*/,
			(resource) => {
				if (
					resource.request === 'fs' ||
					resource.request === 'node:fs' ||
					resource.request.endsWith('.server') ||
					resource.request.endsWith('.server.ts') ||
					resource.request.endsWith('.server.js') ||
					resource.request.endsWith('.server.jsx') ||
					resource.request === '@-/cli-helpers'
				) {
					resource.request = path.join(webappDirpath, 'stubs/empty.mjs');
				}
			},
		);

		config.plugins.unshift(clientCodeStubsPlugin);
	}
});
