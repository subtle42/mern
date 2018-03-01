const webpack = require('webpack');
const path = require('path');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const BUILD_DIR = path.resolve(__dirname, 'client/.dist');
const APP_DIR = path.resolve(__dirname, 'client/app');

const config = {
  watch:true,
  entry: {
    app: APP_DIR + '/index.tsx'
  },
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js'
  },
  devtool: "source-map",
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.css']
  },
  module: {
    loaders: [{
      test: /\.(tsx|ts)?$/,
      loader: 'ts-loader'
    }, {
      test: /\.css$/,
      loader: 'style-loader!css-loader'
    }, {
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      loader: 'url-loader',
      options: {
        limit: 10000
      }
    }]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: "node-static",
      filename: "vendor.js",
      minChunks(module, count) {
          return module.context && module.context.indexOf("node_modules") > -1;
      }
    }),
    new LiveReloadPlugin({}),
    // new BundleAnalyzerPlugin({
    //   analyzerMode: 'static'
    // })
  ]
};

module.exports = config;