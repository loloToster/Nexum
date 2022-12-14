// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
require("dotenv").config()

// eslint-disable-next-line no-undef
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "transform-inline-environment-variables",
      [
        "module-resolver",
        {
          root: ["./"],
          extensions: [
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".android.js",
            ".android.tsx",
            ".ios.js",
            ".ios.tsx"
          ]
        }
      ]
    ]
  }
}
