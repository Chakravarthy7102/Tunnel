const { defineConfig } = require('@tunnel/eslint-config');

module.exports = defineConfig({
	rules: {
		// We need eval for JS patches
		'no-eval': 'off',
	},
});
