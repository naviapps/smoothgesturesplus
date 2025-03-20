import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslint from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import checkFile from 'eslint-plugin-check-file';
import autoImports from './.wxt/eslint-auto-imports.mjs';

export default tseslint.config(
  {
    extends: [eslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {},
      },
    },
    extends: [
      autoImports,
      tseslint.configs.recommendedTypeChecked,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      reactHooks.configs['recommended-latest'],
      jsxA11y.flatConfigs.recommended,
      eslintPluginUnicorn.configs.recommended,
      eslintPluginPrettierRecommended,
    ],
    rules: {
      eqeqeq: ['error', 'always'],
      'import/no-unresolved': ['error', { ignore: ['^/'] }],
      '@typescript-eslint/unbound-method': 'off',
      'import/no-cycle': 'error',
      'linebreak-style': ['error', 'unix'],
      'react/prop-types': 'off',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'prettier/prettier': ['error', { usePrettierrc: true }],
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
