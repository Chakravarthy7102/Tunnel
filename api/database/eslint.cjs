const { defineConfig } = require('@tunnel/eslint-config');

module.exports = defineConfig({
	ignorePatterns: ['**/_generated'],
	rules: {
		'no-console': 'off',
		'unicorn/filename-case': 'off',
		'no-await-in-loop': 'off',
	},
});
