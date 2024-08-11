const { defineConfig } = require('@tunnel/eslint-config');

module.exports = defineConfig({
	rules: {
		'@typescript-eslint/no-non-null-assertion': 'off',
		'no-await-in-loop': 'off',
		'no-bitwise': 'off',
	},
});
