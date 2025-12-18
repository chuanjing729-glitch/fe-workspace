const path = require('path');
const { WebpackCoveragePlugin } = require('../src/index');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new WebpackCoveragePlugin({
      enabled: process.env.ENABLE_SELF_TEST === 'true',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [/node_modules/, /\.test\./, /\.spec\./],
      outputDir: '.coverage'
    })
  ]
};
