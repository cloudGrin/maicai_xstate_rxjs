module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'no-console': 'off',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          // 中划线
          kebabCase: false,
          // 小驼峰
          camelCase: true,
          // 下划线
          snakeCase: false,
          // 大驼峰
          pascalCase: false
        },
        // ignore: [/.d.ts$/i]
      }
    ]
  }
}
