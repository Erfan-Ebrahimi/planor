import js from '@eslint/js'
import vue from 'eslint-plugin-vue'

export default [
  { ignores: ['dist/**', '.pnpm-store/**', '.sites-runtime/**'] },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    files: ['harness/**/*.js', 'resources/js/**/*.{js,vue}'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
      },
    },
  },
  {
    files: ['harness/**/*.js'],
    languageOptions: {
      globals: {
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
      },
    },
  },
  {
    files: ['**/*.{js,vue}'],
    ignores: ['resources/js/lib/inertia.js'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{
          name: '@inertiajs/vue3',
          message: 'Import from resources/js/lib/inertia.js.',
        }],
      }],
    },
  },
]
