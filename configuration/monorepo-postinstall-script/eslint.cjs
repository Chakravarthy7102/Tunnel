const { defineConfig } = require('@tunnel/eslint-config');

module.exports = defineConfig({
	rules: {
		'import/extensions': 'off',
		'no-console': 'off',
		'no-restricted-imports': 'off',
	},
});
