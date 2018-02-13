var webpack = require('webpack');
var path = require('path');
var LiveReloadPlugin = require('webpack-livereload-plugin');

var BUILD_DIR = path.resolve(__dirname, 'client/.dist');
var APP_DIR = path.resolve(__dirname, 'client/app');

var config = {
  watch:true,
  entry: {
    app: APP_DIR + '/index.tsx',
    vendor: ['react', 'react-dom']
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
      name: "vendor",
      filename: "vendor.js"
    }),
    new LiveReloadPlugin({})
  ]
};

module.exports = config;