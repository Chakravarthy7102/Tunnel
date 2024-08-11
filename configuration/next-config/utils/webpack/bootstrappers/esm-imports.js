const { defineBootstrapper } = require('../utils/bootstrapper.js');

module.exports = defineBootstrapper((config, { webpack }) => {
	config.plugins.push(
		new webpack.NormalModuleReplacementPlugin(/\.jsx?$/, (resource) => {
			if (!resource.context.includes('/node_modules/')) {
				resource.request = resource.request.replace(/\.[^.]+$/, '');
			}
		}),
	);
});
