// NOTE: right now quasar doesn't work with eslint 9+ version. This file will not apply any rules to the code.
//@ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

const ignores = [
  'dist/',
  'src-capacitor/',
  'src-cordova/',
  'src-electron/',
  '.quasar/',
  'node_modules/',
  '.eslintrc.cjs',
  'src-ssr/',
  'quasar.config.*.temporary.compiled*',
];

export default tseslint.config(
  {
    files: ['src/**/*.ts', 'src/**/*.vue', 'src/**/*.js'],
    plugins: {
      'typescript-eslint': tseslint.plugin,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginVue.configs['flat/strongly-recommended'],
    ],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
      globals: {
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        __statics: 'readonly',
        __QUASAR_SSR__: 'readonly',
        __QUASAR_SSR_SERVER__: 'readonly',
        __QUASAR_SSR_CLIENT__: 'readonly',
        __QUASAR_SSR_PWA__: 'readonly',
        process: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly',
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    rules: {
      'prefer-promise-reject-errors': 'off',
      quotes: ['warn', 'single', { avoidEscape: true }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars':
        process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'vue/no-v-text-v-html-on-component': 'off',
      'vue/no-parsing-error': 'off',
      'vue/require-default-prop': 'off',
    },
    ignores,
  },
  { ...eslintConfigPrettier, ignores }
);
