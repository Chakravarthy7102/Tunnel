const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

const { defineBootstrapper } = require('../utils/bootstrapper.js');

module.exports = defineBootstrapper((config) => {
	config.plugins.push(
		new FilterWarningsPlugin({
			exclude: /(the request of a dependency is an expression)|(negative zero)/,
		}),
	);

	config.devServer = {
		stats: {
			warnings: false,
		},
	};

	config.stats = {
		warnings: false,
	};
});
