import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.dev.json'],
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      quotes: ['error', 'single'],
      'import/no-unresolved': 0,
      indent: ['error', 2],
      'max-len': ['error', { code: 100 }],
      'object-curly-spacing': ['error', 'always'],
    },
  },
  {
    ignores: ['lib/**/*', 'generated/**/*'],
  },
];
