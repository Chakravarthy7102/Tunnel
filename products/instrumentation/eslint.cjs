const { defineConfig } = require('@tunnel/eslint-config');

module.exports = defineConfig({
	rules: {
		'no-console': 'off',
		// We need eval for JS patches
		'no-eval': 'off',
		'no-multi-assign': 'off',
	},
});
