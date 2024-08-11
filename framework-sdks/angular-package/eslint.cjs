const { defineConfig } = require('@tunnel/eslint-config');

module.exports = defineConfig({
	ignorePatterns: ['.angular', './projects'],
	rules: {
		'dot-notation': 'off',
		'import/extensions': 'off',
	},
});
