const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

module.exports = [
  { ignores: ['node_modules/', 'coverage/', 'docs/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_' }],
    },
  },
  {
    // Kelas interface & template sequelize-cli: parameter sengaja tidak dipakai (dokumentasi kontrak).
    files: [
      'src/repositories/*.js',
      'src/storages/*.js',
      'src/security/*.js',
      'src/media/*.js',
      'migrations/*.js',
      'seeders/*.js',
    ],
    rules: { 'no-unused-vars': ['error', { args: 'none' }] },
  },
  {
    files: ['**/*.test.js', 'test/**/*.js'],
    languageOptions: { globals: { ...globals.jest } },
  },
  prettier,
];
