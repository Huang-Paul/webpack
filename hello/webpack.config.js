const webpack = require("webpack");
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin"); // 獨立css檔
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 寫入 ExtractTextPlugin 實體
const extractCSS = new ExtractTextPlugin("css/[name].css");

module.exports = {
  // 可是使用 process.env 來取得環境變數 NODE_ENV
  mode: process.env.NODE_ENV,
  // 用來指定 entry 的資料夾
  context: path.resolve(__dirname, "./src"),
  // 注入點（需絕對路徑）
  entry: {
    index: "./js/index.js",
    about: "./js/about.js"
  },
  // 輸出的設定
  output: {
    // 指定 output 的資料夾
    path: path.resolve(__dirname, "./dist"),
    // [name] 讀的是 entry 的 key
    filename: "./js/[name].js"
  },
  // 僅限開發時可以使用，build 後就不能用
  resolve: {
    // 設定引用時省略路徑，只適合在 js 使用，在 css 裡可用“～”來取代
    modules: [
      path.resolve("src"),
      path.resolve("src/js"),
      path.resolve("src/scss"),
      path.resolve("src/images"),
      path.resolve("node_modules")
    ],
    // 設定引用時省略副檔名
    extensions: [".js"]
  },
  // webpack-dev-server 設定
  devServer: {
    compress: true,
    port: 3000,
    stats: {
      assets: true,
      cached: false,
      chunkModules: false,
      chunkOrigins: false,
      chunks: false,
      colors: true,
      hash: false,
      modules: false,
      reasons: false,
      source: false,
      version: false,
      warning: false
    }
  },
  // 將 node_modules 分離出一隻獨立的.js，避免 entry.js 過大
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: "vendor",
          chunks: "initial",
          enforce: true
        }
      }
    }
  },
  // 讀取非js檔案時要用的功能
  module: {
    rules: [
      {
        test: /\.css$/,
        /*
          css-loader: 在.js import .css
          postcss-loader: 加入瀏覽器相容性前綴
          include: 表示需要 loader 轉換的文件 (引入)
          exClude: 表示不需要 loader 轉換的文件 (排除)
        */
        use: extractCSS.extract(["css-loader", "postcss-loader"]),
        include: path.resolve("src/css"),
        exClude: path.resolve("./node_modules")
      },
      {
        test: /\.(sass|scss)/,
        // sass-loader: 在.js import .scss
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
        include: path.resolve("src/scss"),
        exClude: path.resolve("./node_modules")
      },
      {
        /*
        babel 安裝套件：
          babel-loader: 轉譯高版本的js
          @babel/core: 調用 babel 時所需要的 API 核心
          @babel/preset-env: 用 babel 編譯的版本是哪個版本，可用最新版本的 js 來編譯
        */
        test: /\.js$/,
        use: "babel-loader",
        inClude: path.resolve(".")
      },
      /*
        url-loader 需搭配 style-loader 來使用，適合用來處理小圖片如：icon
        image-webpack-loader 用於圖片壓縮
      */
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              // 圖片大小限制，超過就轉換成 base64
              limit: 8192,
              // 轉換的路徑
              name: "[path][name].[ext]?[hash: 8]"
            }
          },
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              optipng: {
                enablad: false
              },
              pngquant: {
                quality: "65-90",
                speed: 4
              },
              gifsicle: {
                interlaced: false
              }
            }
          }
        ],
        include: path.resolve("src/images"),
        exClude: path.resolve("./node_modules")
      },
      // 為了讓 sass-loader 也能讀到字行副檔名而設置
      {
        test: /\.(woff|woff2|ttf|eot)$/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]?[hash:8]"
        },
        include: path.resolve("src/assets"),
        exClude: path.resolve("./node_modules")
      }
    ]
  },
  /*
  plugins 說明
    extractCSS: 將 css 獨立成一個檔
    CopyWebpackPlugin: 將不需要用 loader 處理的檔案，直接複製到目標目錄下
    ProvidePlugin: 將套件變成全域性，因不易管理，非必要不要用
  */
  // 來解決 loader 無法解決的事情dk4
  plugins: [
    extractCSS,
    new CopyWebpackPlugin([{ from: "assets", to: "assets" }]),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery"
    }),
    new HtmlWebpackPlugin({
      title: "Webpack前端自動化開發",
      filename: "index.html",
      template: "html/template.html",
      viewport: "width=640, user-scalable=no",
      chunks: ["index", "vendor"]
    })
  ]
};
