let publicPath = process.env.NODE_ENV === 'production' ? './' : './';

module.exports = {
  publicPath,
  productionSourceMap: false,
  chainWebpack: config => {
      config.module
          .rule('vue')
          .use('vue-loader')
          .tap(options => {
              options.compiler = require('vue-template-babel-compiler')
              return options
          })
  }
}
