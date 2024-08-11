const { defineBootstrapper } = require('../utils/bootstrapper.js');

/**
	@see https://github.com/webpack/webpack-dev-server/issues/851#issuecomment-449638008
*/
module.exports = defineBootstrapper((config) => {
	config.devServer = {
		...config.devServer,
		disableHostCheck: true,
	};
});
