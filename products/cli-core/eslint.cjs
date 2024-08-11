const { defineConfig } = require('@tunnel/eslint-config');

module.exports = defineConfig({
	rules: {
		'unicorn/no-array-callback-reference': 'off',
		'prefer-destructuring': 'off',
	},
});
