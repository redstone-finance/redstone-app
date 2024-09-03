const path = require('path');

let publicPath = process.env.NODE_ENV === 'production' ? './' : './';

module.exports = {
  publicPath,
  productionSourceMap: true,
  chainWebpack: config => {
    // Existing vue-loader configuration
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.compiler = require('vue-template-babel-compiler')
        return options
      });

    // Configuration for handling node_modules, excluding core-js
    config.module
      .rule('babel-for-node-modules')
      .test(/\.m?js$/)
      .include
        .add(path.resolve(__dirname, 'node_modules'))
        .end()
      .exclude
        .add(/core-js/)
        .end()
      .use('babel-loader')
        .loader('babel-loader')
        .options({
          presets: [
            ['@babel/preset-env', { modules: 'auto' }]
          ],
          plugins: [
            '@babel/plugin-proposal-private-methods',
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-modules-commonjs'
          ]
        });

    // Add alias configuration
    config.resolve.alias
      .set('@', path.resolve(__dirname, 'src'));
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  }
}