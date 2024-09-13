const config = require("redstone-prettier-config");

module.exports = {
  ...config,
  vueIndentScriptAndStyle: true,
  endOfLine: "lf",
  insertFinalNewline: true,
  overrides: [
    {
      files: "*.vue",
      options: {
        parser: "vue",
        vueIndentScriptAndStyle: true
      },
    },
  ],
};
