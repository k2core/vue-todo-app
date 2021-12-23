const webpack = require('webpack')
const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const { merge } = require('webpack-merge')
require('@babel/polyfill')

module.exports = (env, opts) => {
  const config = {
    resolve: {
      extensions: ['.vue', '.js'],
      fallback: {
        fs: false,
        path: false,
        util: require.resolve('util/'),
        crypto: require.resolve('crypto-browserify'),
        stream: false,
        buffer: require.resolve('util/')
      }
    },
    // 중복 옵션
    entry: {
      app: ['@babel/polyfill', path.join(__dirname, 'main.js')]
    },
    output: {
      filename: '[name].js', // app.js
      path: path.join(__dirname, 'dist')
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.js$/,
          // exclude: /node_modules/,
          loader: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: ['vue-style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.scss$/,
          use: [
            'vue-style-loader',
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ]
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'index.html')
      }),
      new CopyPlugin({
        patterns: [{ from: 'assets/', to: '' }]
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser'
      })
    ]
  }

  // 개발용
  if (opts.mode === 'development') {
    return merge(config, {
      // 추가 개발용 옵션
      devtool: 'eval',
      devServer: {
        open: false,
        hot: true
      }
    })
  } else {
    // 제품용
    return merge(config, {
      // 추가 제품용 옵션
      devtool: 'cheap-module-source-map',
      plugins: [new CleanWebpackPlugin()]
    })
  }
}
