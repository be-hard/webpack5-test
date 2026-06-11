const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = (env, argv) =>
  merge(common(argv.mode), {
    mode: "production",
    devtool: "source-map",

    module: {
      rules: [
        {
          test: /\.module\.s?css$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                importLoaders: 2,
                modules: {
                  localIdentName: "[hash:base64:8]",
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
            MiniCssExtractPlugin.loader,
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
    plugins: [
      new MiniCssExtractPlugin({
        filename: "css/[name].[contenthash:8].css",
        chunkFilename: "css/[name].[contenthash:8].chunk.css",
      }),
    ],
    optimization: {
      moduleIds: "deterministic",
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router-dom)[\\/]/,
            name: "react-vendor",
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
          },
          common: {
            minChunks: 2,
            name: "common",
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
      minimize: true,
      minimizer: [
        `...`, // 继承 webpack 内置的 TerserPlugin
        new CssMinimizerPlugin(),
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.imageminMinify,
            options: {
              plugins: [
                ["gifsicle", { interlaced: true }],
                ["jpegtran", { progressive: true }],
                ["optipng", { optimizationLevel: 5 }],
                [
                  "svgo",
                  {
                    plugins: [
                      {
                        name: "removeViewBox",
                        active: false,
                      },
                    ],
                  },
                ],
              ],
            },
          },
        }),
      ],
    },
  });
