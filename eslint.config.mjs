import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: { globals: globals.browser },
    plugins: ['webextensions', 'jquery'],
    rules: {
      yoda: 'error',
    },
  },
  pluginJs.configs.recommended,
];
