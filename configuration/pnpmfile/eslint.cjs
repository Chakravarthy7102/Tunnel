const { defineConfig } = require('@tunnel/eslint-config');

module.exports = defineConfig({
	rules: {
		'no-console': 'off',
		'no-restricted-imports': 'off',
	},
});
