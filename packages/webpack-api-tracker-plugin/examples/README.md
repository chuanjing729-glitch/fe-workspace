# Example Project for webpack-api-tracker-plugin

This is an example project demonstrating how to use the `webpack-api-tracker-plugin`.

## Installation

```bash
npm install
```

## Usage

To use the API tracker plugin, add it to your webpack configuration:

```javascript
// webpack.config.js
const path = require('path');
const ApiTrackerPlugin = require('webpack-api-tracker-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  plugins: [
    new ApiTrackerPlugin({
      mode: 'openapi',
      openApiSpec: './openapi.yaml',
      snapshotPath: './.api-tracker/api-snapshot.json',
      diffReportPath: './.api-tracker/diff-report.json'
    })
  ]
};
```

## Configuration Options

See the main documentation for detailed configuration options.

## Running the Example

```bash
npm start
```

This will start the webpack dev server with the API tracker plugin enabled.