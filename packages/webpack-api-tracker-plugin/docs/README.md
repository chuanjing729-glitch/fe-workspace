# webpack-api-tracker-plugin

A Webpack plugin for API contract tracking and change detection.

## Overview

The `webpack-api-tracker-plugin` is designed to act as a "gatekeeper" for interface contracts, responsible for data synchronization, cleaning, desensitization, and change analysis. It works in conjunction with `webpack-coverage-plugin` to provide a complete quality assurance solution.

## Features

- API contract snapshot generation
- API change detection and reporting
- Multiple data collection modes (OpenAPI/Crawler)
- Integration with webpack-coverage-plugin
- Runtime notification bubbles for API changes
- Security configuration isolation

## Installation

```bash
npm install webpack-api-tracker-plugin --save-dev
```

## Usage

```javascript
// webpack.config.js
const ApiTrackerPlugin = require('webpack-api-tracker-plugin');

module.exports = {
  // ... other configuration
  plugins: [
    new ApiTrackerPlugin({
      // Configuration options
    })
  ]
};
```

## Configuration

Refer to the [requirements document](../../requirements/api-tracker-requirement.md) for detailed configuration options.

## License

MIT