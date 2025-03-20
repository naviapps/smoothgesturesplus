import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import checkFile from 'eslint-plugin-check-file';
import autoImports from './.wxt/eslint-auto-imports.mjs';

export default tseslint.config(
  {
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: {} },
    },
    extends: [
      autoImports,
      tseslint.configs.recommended,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      reactHooks.configs['recommended-latest'],
      jsxA11y.flatConfigs.recommended,
      eslintPluginUnicorn.configs.recommended,
      eslintConfigPrettier,
    ],
    rules: {
      eqeqeq: ['error', 'always'],
      'linebreak-style': ['error', 'unix'],
      'import/no-cycle': 'error',
      'import/no-unresolved': ['error', { ignore: ['^/'] }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'jsx-a11y/anchor-is-valid': [
        'warn',
        {
          components: ['Link'],
          aspects: ['invalidHref', 'preferButton'],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/no-for-loop': 'off',
      'unicorn/no-array-for-each': 'off',
    },
  },
  {
    files: ['**/*'],
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      'check-file/folder-naming-convention': [
        'error',
        {
          '**/*': 'KEBAB_CASE',
        },
      ],
    },
  },
);
