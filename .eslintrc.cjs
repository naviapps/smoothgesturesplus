module.exports = {
  root: true,
  env: { browser: true, es2020: true, webextensions: true, jquery: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  rules: {
    //yoda: ['error', 'always']
  }
}
