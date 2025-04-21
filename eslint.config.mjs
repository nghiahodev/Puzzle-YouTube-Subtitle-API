import pluginJs from '@eslint/js'
import globals from 'globals'

export default [
  {
    ...pluginJs.configs.recommended,

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node, // Add global variables of Node.js
      },
    },

    rules: {
      ...pluginJs.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-empty': 'warn',
      'no-console': 'warn',
    },
  },
]
