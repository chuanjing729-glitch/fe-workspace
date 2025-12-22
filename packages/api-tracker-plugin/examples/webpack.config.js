const path = require('path');
const ApiTrackerPlugin = require('../dist/index.js'); // Using the built version

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
  },
  plugins: [
    new ApiTrackerPlugin({
      mode: 'openapi',
      openApiSpec: './openapi.yaml',
      snapshotPath: './.api-tracker/api-snapshot.json',
      diffReportPath: './.api-tracker/diff-report.json',
      notifications: {
        enabled: true,
        position: 'top-right',
        timeout: 5000
      }
    })
  ]
};