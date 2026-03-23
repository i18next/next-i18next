import neostandard from 'neostandard'

export default [
  { ignores: ['dist', 'examples', 'node_modules', '**/*.d.ts'] },
  ...neostandard({ ts: true }),
  {
    rules: {
      '@stylistic/comma-dangle': 'off',
      '@stylistic/space-before-function-paren': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.test.*', '**/*.spec.*'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
