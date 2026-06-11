const paths = require("./paths");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const dotenv = require("dotenv");

const getEnvConfig = (mode = "production") => {
  const envPath = `${paths.config}/env/.env.${mode}`;
  const envConfig = dotenv.config({ path: envPath }).parsed || {};
  const shellEnv = Object.keys(process.env)
    .filter((key) => key.startsWith("APP_"))
    .reduce((acc, key) => {
      acc[key] = process.env[key];
      return acc;
    }, {});
  const mergedEnvConfig = {
    ...envConfig,
    ...shellEnv,
  };
  // 只暴露以 APP_ 开头的环境变量给前端使用，其他的环境变量不会被注入到代码中，避免泄露敏感信息。
  const appEnv = Object.keys(mergedEnvConfig)
    .filter((key) => key.startsWith("APP_"))
    .reduce((acc, key) => {
      acc[`process.env.${key}`] = JSON.stringify(mergedEnvConfig[key]);
      return acc;
    }, {});
  return appEnv;
};

module.exports = (mode) => ({
  entry: {
    app: `${paths.src}/index.tsx`,
  },
  // 控制的是“Webpack 最终把文件输出到哪里、文件叫什么、浏览器从哪里加载这些资源”
  output: {
    path: paths.dist,
    filename: "js/[name].[contenthash:8].js",
    chunkFilename: "js/[name].[contenthash:8].chunk.js",
    // 控制浏览器访问资源时使用的公共路径。
    publicPath: "/",
    assetModuleFilename: "assets/[name].[contenthash:8][ext]",
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      "@": paths.src,
      "@shared": `${paths.src}/shared`,
      "@services": `${paths.src}/services`,
      "@features": `${paths.src}/features`,
      "@app": `${paths.src}/app`,
      "@pages": `${paths.src}/pages`,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: paths.src,
        use: {
          loader: "swc-loader",
          options: {
            // SWC 的 JavaScript/TypeScript 编译配置区域
            jsc: {
              target: "es2020",
              parser: {
                syntax: "typescript",
                tsx: true,
                decorators: true,
              },
              transform: {
                // 开启后，你写 JSX 时不需要每个文件都手动引入 React 了
                react: {
                  runtime: "automatic",
                },
              },
            },
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 小于 8KB 的图片会被内联为 Base64
          },
        },
      },
      /** React 项目里 SVG 经常也要当组件用，所以单独配置更灵活。
       * import IconSearch from './search.svg?component';
       * export function Button() {
       * return <IconSearch className="icon" />;
       * }
       *  */
      {
        test: /\.svg$/,
        oneOf: [
          {
            resourceQuery: /component/, // 例如：import Icon from './icon.svg?component'
            use: ["@svgr/webpack"], // 使用 SVGR 将 SVG 转换为 React 组件
          },
          {
            type: "asset", // 其他情况按普通图片处理
          },
        ],
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: `${paths.public}/index.html`,
    }),
    new ForkTsCheckerWebpackPlugin(),
    new webpack.DefinePlugin(getEnvConfig(mode)),
  ],
});
