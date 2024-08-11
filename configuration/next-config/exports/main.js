module.exports = {
	createNextConfig(dirname, configToMerge) {
		require('tsx/cjs');

		return require('../utils/config.js').createNextConfig(
			dirname,
			configToMerge,
		);
	},
};
