const { defineBootstrapper } = require('../utils/bootstrapper.js');

module.exports = defineBootstrapper(
	(config, { isServer, nextRuntime }) => {
		if (isServer) {
			if (nextRuntime === 'edge') {
				return;
			}

			config.externals.push(
				'fs',
				// Used by "@linear/sdk"
				'encoding',
				{
					'utf-8-validate': 'commonjs utf-8-validate',
					bufferutil: 'commonjs bufferutil',
				},
			);
		}
	},
);
