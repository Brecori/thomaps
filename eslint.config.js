import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import hooks from 'eslint-plugin-react-hooks'
import refresh from 'eslint-plugin-react-refresh'

const forbiddenLevels = (levels) => ({
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          regex: `^@/components/(${levels.join('|')})/`,
          message:
            'Respeite a composição de Atomic Design; use props/slots para inverter a dependência.',
        },
      ],
    },
  ],
})

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'playwright-report',
      'test-results',
      'public',
      'data-sources',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': hooks, 'react-refresh': refresh },
    rules: {
      ...hooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: ['src/components/atoms/**/*.{ts,tsx}'],
    rules: forbiddenLevels(['molecules', 'organisms', 'templates', 'pages']),
  },
  {
    files: ['src/components/molecules/**/*.{ts,tsx}'],
    rules: forbiddenLevels(['organisms', 'templates', 'pages']),
  },
  {
    files: ['src/components/organisms/**/*.{ts,tsx}'],
    rules: forbiddenLevels(['organisms', 'templates', 'pages']),
  },
  {
    files: ['src/components/templates/**/*.{ts,tsx}'],
    rules: forbiddenLevels(['pages']),
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['react', 'react-dom', 'gsap', '@gsap/react'],
          patterns: [
            '@/components/**',
            '@/hooks/**',
            '@/services/**',
            '@/app/**',
          ],
        },
      ],
    },
  },
)
