const path = require('path');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const APP_DIR = path.resolve(__dirname, 'client/app');


module.exports = {
    watch: false,
    mode: "development",
    devtool: "source-map",
    entry: APP_DIR + '/index.tsx',
    output: {
        filename: '[name].bundle.js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, 'client/.dist')

    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js','.css'],
        alias: {
            "data": path.resolve(__dirname, "client/data"),
            "common": path.resolve(__dirname, "common")
        }
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
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
        }],
    },
    optimization: {
        runtimeChunk: {
            name: "manifest"
        },
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    priority: -20,
                    chunks: "all"
                }
            }
        }

    },
    plugins: [
        new LiveReloadPlugin({}),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static'
        })
    ]
};