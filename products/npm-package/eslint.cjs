const { defineConfig } = require('@tunnel/eslint-config');

module.exports = defineConfig({
	rules: {
		'no-console': 'off',
		'unicorn/prefer-top-level-await': 'off',
		// We use `node:path` to minimize file size
		'no-restricted-imports': 'off',
	},
});
