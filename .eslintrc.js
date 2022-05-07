module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  ignorePatterns: ['.eslintrc.js'],
  extends: ['airbnb-base', 'airbnb-typescript/base', 'plugin:rxjs/recommended', 'plugin:prettier/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: ['unicorn', '@typescript-eslint'],
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
        }
        // ignore: [/.d.ts$/i]
      }
    ],
    'prefer-promise-reject-errors': 'off',
    "rxjs/no-implicit-any-catch": [
      "error",
      { "allowExplicitAny": true }
    ]
  }
}
