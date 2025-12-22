const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

// 使用新的 incremental-coverage-plugin
const WebpackIncrementalCoveragePlugin = require('../../../incremental-coverage-plugin/dist/webpack.js').default;

module.exports = {
    mode: 'development',
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        clean: true
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            template: './index.html'
        }),
        // 新插件配置
        WebpackIncrementalCoveragePlugin({
            include: ['src/**'],
            exclude: ['**/*.spec.js', '**/node_modules/**'],
            gitDiffBase: 'main',
            outputDir: '.coverage-new',
            reportFormat: 'html',
            threshold: 80
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8081,  // 使用不同的端口避免冲突
        hot: true,
        open: false
    },
    devtool: 'source-map'
};
