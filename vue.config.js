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

    // New ESLint configuration with Prettier integration
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .tap(options => {
        options.plugins = [...(options.plugins || []), 'prettier'];
        options.extends = [...(options.extends || []), 'plugin:prettier/recommended'];
        options.rules = {
          ...options.rules,
          'prettier/prettier': 'error',
        };
        return options;
      });
  },
  // Add lintOnSave option
  lintOnSave: true
}