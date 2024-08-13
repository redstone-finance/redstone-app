const config = require('redstone-prettier-config')

module.exports = {
  ...config,
  vueIndentScriptAndStyle: true,
  overrides: [
    {
      files: '*.vue',
      options: {
        parser: 'vue'
      }
    }
  ]
}