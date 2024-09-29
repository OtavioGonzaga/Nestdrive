import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: ['**/.eslintrc.mjs', 'node_modules', 'dist'],
	},
	...compat.extends(
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	),
	{
		plugins: {
			'@typescript-eslint': typescriptEslintEslintPlugin,
		},

		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},

			parser: tsParser,
			ecmaVersion: 5,
			sourceType: 'module',

			parserOptions: {
				project: 'tsconfig.json',
				tsconfigRootDir:
					'C:\\Users\\Otavio Luiz Gonzaga\\Desktop\\Desenvolvimento\\Projetos\\nestdrive',
			},
		},

		rules: {
			'@typescript-eslint/explicit-function-return-type': 'warn',
			'@typescript-eslint/explicit-module-boundary-types': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/await-thenable': 'warn',
			'@typescript-eslint/consistent-type-imports': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
		},
	},
];
