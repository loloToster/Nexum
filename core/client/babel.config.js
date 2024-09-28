// eslint-disable-next-line no-undef
module.exports = function (api) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
  require("dotenv").config()

  api.cache(false)

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
      ],
      "@babel/plugin-proposal-export-namespace-from",
      "react-native-reanimated/plugin"
    ]
  }
}
