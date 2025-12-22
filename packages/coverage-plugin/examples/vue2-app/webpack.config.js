const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');

const { WebpackCoveragePlugin } = require('../../dist/cjs/index.js');

module.exports = {
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
        new WebpackCoveragePlugin({
            // === 基础配置 ===
            enabled: true,
            include: [path.resolve(__dirname, 'src')],
            outputDir: '.coverage',

            // === UI 配置 ===
            enableOverlay: true,  // 启用浏览器覆盖率 UI

            // === v3.0 新特性 ===
            reportTimer: 5000,        // 报告生成间隔（毫秒），默认 30000
            useIstanbulDiff: true,    // 使用 istanbul-diff 计算（默认 true）

            // === 质量门禁（可选）===
            qualityGate: {
                lineCoverageThreshold: 80  // 行覆盖率阈值
            }
        })
    ],
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 8888,
        hot: true,
        historyApiFallback: true
    }
};
