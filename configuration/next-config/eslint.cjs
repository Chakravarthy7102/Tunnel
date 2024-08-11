const { defineConfig } = require('@tunnel/eslint-config');

module.exports = defineConfig({
	rules: {
		// The package's dependencies might not have been installed
		'no-restricted-imports': 'off',
	},
});
