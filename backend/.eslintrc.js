module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Allow local iteration with console, and relax unused vars in placeholders via overrides below
    'no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'no-console': 'off', // Allow console for logging
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-function-paren': ['error', 'always'],
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
  },
  overrides: [
    {
      files: [
        'src/controllers/**/*.js',
        'src/services/**/*.js',
        'src/middleware/**/*.js',
        'src/database/**/*.js',
        'scripts/**/*.js',
        'tests/**/*.js',
      ],
      rules: {
        // Many files are scaffolds or test stubs; don't warn on unused vars/args here
        'no-unused-vars': 'off',
      },
    },
  ],
};
