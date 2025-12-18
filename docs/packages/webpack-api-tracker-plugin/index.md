# webpack-api-tracker-plugin

## 概述

`webpack-api-tracker-plugin` 是一个用于 API 契约跟踪和变更检测的 Webpack 插件。它作为接口契约的"看门人"，负责数据的同步、清洗、脱敏与变动分析，并与 `webpack-coverage-plugin` 协同工作，提供完整的质量保障解决方案。

## 核心功能

1. **API 契约快照生成** - 自动生成和维护 API 契约的快照
2. **API 变更检测** - 实时检测 API 契约的变化
3. **多模式数据采集** - 支持 OpenAPI 规范和网页爬虫两种数据采集模式
4. **与覆盖率插件集成** - 与 `webpack-coverage-plugin` 协同工作
5. **运行时通知气泡** - 在开发阶段提供实时的 API 变更通知
6. **安全配置隔离** - 提供三层安全配置架构

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

详细的配置选项请参考[需求文档](../../../requirements/api-tracker-requirement.md)。

## 许可证

MIT