const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const paths = require("./paths");

module.exports = (env, argv) =>
  merge(common(argv.mode), {
    mode: "development",
    devtool: "eval-cheap-module-source-map",

    cache: {
      type: "filesystem",
    },

    module: {
      rules: [
        {
          test: /\.module\.s?css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 2,
                modules: {
                  localIdentName: "[name]__[local]--[hash:base64:5]",
                },
              },
            },
            "postcss-loader",
            "sass-loader",
          ],
        },
        {
          test: /\.s?css$/,
          exclude: /\.module\.s?css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 2,
              },
            },
            "postcss-loader",
            "sass-loader",
          ],
        },
      ],
    },

    devServer: {
      static: paths.public,
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
      proxy: [
        {
          context: ["/api"],
          target: "http://localhost:5000",
          changeOrigin: true,
        },
        {
          context: ["/auth"],
          target: "http://localhost:5000",
          changeOrigin: true,
        },
      ],
    },
  });
