/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    webextensions: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'boundaries'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['dist', 'node_modules'],
  settings: {
    // Reads baseUrl/paths straight from tsconfig.json (single source of
    // truth for the @entries/@core/... aliases) so both relative and
    // aliased imports resolve to real files for the boundaries rules below.
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
    'boundaries/root-path': 'src',
    'boundaries/elements': [
      { type: 'entries', pattern: 'entries/**' },
      { type: 'core', pattern: 'core/**' },
      { type: 'adapters', pattern: 'adapters/**' },
      { type: 'infrastructure', pattern: 'infrastructure/**' },
      { type: 'ui', pattern: 'ui/**' },
      { type: 'shared', pattern: 'shared/**' },
    ],
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    // Architectural layer boundaries (see AGENTS.md). Keep this in sync with
    // the dependency graph documented there.
    'boundaries/dependencies': [
      'error',
      {
        default: 'disallow',
        message:
          '${file.type} may not import ${dependency.type} (see AGENTS.md dependency rules)',
        rules: [
          {
            from: { type: 'entries' },
            allow: {
              to: {
                type: ['core', 'adapters', 'infrastructure', 'ui', 'shared'],
              },
            },
          },
          { from: { type: 'ui' }, allow: { to: { type: ['core', 'shared'] } } },
          { from: { type: 'adapters' }, allow: { to: { type: ['shared'] } } },
          {
            from: { type: 'infrastructure' },
            allow: { to: { type: ['shared'] } },
          },
          { from: { type: 'core' }, allow: { to: { type: ['shared'] } } },
          { from: { type: 'shared' }, disallow: { to: { type: '*' } } },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['src/core/**/*.ts'],
      rules: {
        // core/ must never reach for chrome.*/DOM globals directly (see AGENTS.md).
        'no-restricted-globals': [
          'error',
          {
            name: 'chrome',
            message:
              'core/ must stay platform-independent — no chrome.* APIs (see AGENTS.md)',
          },
          {
            name: 'window',
            message:
              'core/ must stay platform-independent — no window/DOM (see AGENTS.md)',
          },
          {
            name: 'document',
            message:
              'core/ must stay platform-independent — no window/DOM (see AGENTS.md)',
          },
        ],
        // Re-declare with checkAllOrigins so npm packages are checked too
        // (the base rule above only checks local src/ elements by default).
        // core/ may still only depend on shared/ — no external packages
        // (e.g. pdfjs-dist) either, since that would make it non-portable.
        'boundaries/dependencies': [
          'error',
          {
            default: 'disallow',
            checkAllOrigins: true,
            message:
              'core/ may not import "${dependency.source}" — core must stay platform-independent (see AGENTS.md)',
            rules: [
              { from: { type: 'core' }, allow: { to: { type: ['shared'] } } },
            ],
          },
        ],
      },
    },
  ],
};
