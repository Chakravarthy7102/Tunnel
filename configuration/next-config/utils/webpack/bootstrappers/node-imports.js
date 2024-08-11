const { defineBootstrapper } = require('../utils/bootstrapper.js');

module.exports = defineBootstrapper((config, { isClient, webpack }) => {
	if (isClient) {
		config.plugins.push(
			new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
				const mod = resource.request.replace(/^node:/, '');
				resource.request = mod;
			}),
		);
	}
});
