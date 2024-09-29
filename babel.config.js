module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-syntax-dynamic-import'
  ],
  comments: false, // убирает комментарии из скомпилированного кода
  compact: true    // уменьшает размер выходного кода
};
