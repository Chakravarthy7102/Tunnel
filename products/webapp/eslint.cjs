const { defineNextAppConfig } = require('@tunnel/eslint-config');

module.exports = defineNextAppConfig({
	rules: {
		'no-console': 'off',
		'no-restricted-globals': [
			'error',
			{
				name: 'document',
				message:
					'`document` will be undefined when components are rendered on the server',
			},
		],
	},
});
