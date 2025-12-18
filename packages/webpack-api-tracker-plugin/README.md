# webpack-api-tracker-plugin

一个用于 API 契约跟踪和变更检测的 Webpack 插件。

## 概述

`webpack-api-tracker-plugin` 设计为接口契约的"看门人"，负责数据同步、清洗、脱敏和变更分析。它与 `webpack-coverage-plugin` 协同工作，提供完整的质量保障解决方案。

## 功能特性

- API 契约快照生成
- API 变更检测和报告
- 多种数据采集模式 (OpenAPI/爬虫)
- 与 webpack-coverage-plugin 集成
- 运行时 API 变更通知气泡
- 安全配置隔离

## 安装

```bash
npm install webpack-api-tracker-plugin --save-dev
```

## 使用方法

```javascript
// webpack.config.js
const ApiTrackerPlugin = require('webpack-api-tracker-plugin');

module.exports = {
  // ... 其他配置
  plugins: [
    new ApiTrackerPlugin({
      // 配置选项
    })
  ]
};
```

## 配置选项

详细的配置选项请参考[需求文档](../../requirements/api-tracker-requirement.md)。

## License

MIT