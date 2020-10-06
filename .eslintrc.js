const devDependencies = Object.keys(require('./package.json').devDependencies) || {};

module.exports = {
  env: {
    node: true,
    es2017: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
  },
  plugins: ['prettier', 'promise', 'import', 'node', 'security'],
  extends: [
    'eslint:recommended',
    'plugin:promise/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'google',
    'prettier',
    'plugin:node/recommended',
    'plugin:security/recommended',
  ],
  rules: {
    'brace-style': ['error', '1tbs', {allowSingleLine: true}],
    curly: ['error', 'multi-or-nest', 'consistent'],
    eqeqeq: ['error', 'always'],
    'new-cap': ['off'],
    'no-debugger': ['warn'],
    'no-template-curly-in-string': ['error'],
    'prefer-template': ['warn'],
    'prettier/prettier': ['warn'],
    'require-jsdoc': ['off'],
    'vars-on-top': ['warn'],
    'no-unused-vars': ['error', {varsIgnorePattern: '_'}],
    'security/detect-object-injection': ['off'],
  },
  overrides: [
    {
      files: ['__tests__/**', '**/__mocks__/**', 'test/**', 'util/**'],
      env: {
        'jest/globals': true,
      },
      plugins: ['jest'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
      rules: {
        'node/no-unpublished-require': ['error', {allowModules: devDependencies}],
      },
    },
    {
      files: ['static/**/*.js'],
      // plugins: ['compat'], something's up with eslint-plugin-compat "Unknown browser query `Baidu all`"
      env: {
        node: false,
        browser: true,
      },
      // extends: ['plugin:compat/recommended'],
    },
    {
      files: ['./postcss.config.js', 'bin/seed*'],
      rules: {
        'node/no-unpublished-require': ['error', {allowModules: devDependencies}],
      },
    },
  ],
};
