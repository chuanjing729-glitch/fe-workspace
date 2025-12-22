const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackIncrementalCoveragePlugin } = require('../../dist/webpack');

module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },

    // 必须配置 source map
    devtool: 'eval-source-map',

    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    cacheDirectory: true
                }
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            }
        ]
    },

    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html',
            title: 'Webpack 4 + Vue 2 Example'
        }),

        // Incremental Coverage Plugin
        WebpackIncrementalCoveragePlugin({
            include: ['src/**', '**/src/**'],  // 匹配 src 下的所有文件
            exclude: ['**/*.test.js', '**/*.spec.js'],
            gitDiffBase: 'main',
            threshold: 50,  // 降低阈值便于测试
            reportInterval: 5000,  // 5秒生成一次
            historyCount: 10,
            enableOverlay: true
        })
    ],

    devServer: {
        contentBase: path.join(__dirname, 'dist'),  // webpack 4 使用 contentBase
        compress: true,
        port: 8090,
        hot: true,
        open: true,
        // ✅ 无需配置 setupMiddlewares 或 before
        // 插件会自动检测并使用正确的 API
    }
};
