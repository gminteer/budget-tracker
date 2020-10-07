const devDependencies =
  Object.keys(require('./package.json').devDependencies) || {};

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
      files: ['public/**/*.js'],
      env: {
        node: false,
        browser: true,
      },
    },
    {
      files: ['bin/seed'],
      rules: {
        'node/no-unpublished-require': [
          'error',
          {allowModules: devDependencies},
        ],
      },
    },
  ],
};
