const path = require('path');
const { WebpackCoveragePlugin } = require('../../dist/cjs/index.js');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '.'),
    },
    compress: true,
    port: 9000,
  },
  plugins: [
    new WebpackCoveragePlugin({
      enabled: process.env.ENABLE_SELF_TEST === 'true',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [/node_modules/, /\.test\./, /\.spec\./],
      enableOverlay: true, // 启用运行时小气泡
      enableImpactAnalysis: true // 启用影响范围分析
    })
  ]
};