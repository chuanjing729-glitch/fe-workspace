const { rspackCoveragePlugin } = require('@51jbs/webpack-coverage-plugin/rspack');
const path = require('path');

module.exports = {
    entry: './src/index.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    plugins: [
        rspackCoveragePlugin({
            enabled: true,
            enableOverlay: true,
            enableImpactAnalysis: false
        })
    ]
};
