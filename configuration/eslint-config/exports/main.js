import * as eslintrc from '@eslint/eslintrc';
import eslint from '@eslint/js';
import eslintPluginJsonc from 'eslint-plugin-jsonc';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
	...tseslint.configs.recommended,
	{
		languageOptions: {
			globals: eslintrc.Legacy.environments.get('es2024'),
		},
		plugins: {
			unicorn: eslintPluginUnicorn,
		},
		rules: {},
	},
);
