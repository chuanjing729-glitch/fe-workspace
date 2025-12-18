const path = require('path');
const WebpackCoveragePlugin = require('../../dist/index').default;

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new WebpackCoveragePlugin({
      enabled: process.env.ENABLE_SELF_TEST === 'true'
    })
  ]
};
