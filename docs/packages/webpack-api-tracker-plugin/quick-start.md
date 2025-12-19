# 快速开始

## 📦 安装

```bash
npm install webpack-api-tracker-plugin --save-dev
```

## ⚙️ 基础配置

### webpack.config.js

```javascript
const ApiTrackerPlugin = require('webpack-api-tracker-plugin');

module.exports = {
  // ... 其他配置
  plugins: [
    new ApiTrackerPlugin({
      // 配置选项
      enabled: true,
      mode: 'openapi', // 'openapi' | 'crawler'
      outputPath: '.api-tracker',
      openapi: {
        specPath: 'path/to/openapi.yaml',
        url: 'http://localhost:3000/api-docs'
      },
      crawler: {
        baseUrl: 'http://localhost:3000',
        paths: ['/api/**']
      }
    })
  ]
};
```

## 🎯 使用场景

### 1. OpenAPI 模式

```javascript
// webpack.config.js
new ApiTrackerPlugin({
  mode: 'openapi',
  openapi: {
    specPath: 'docs/swagger.yaml'
  }
})
```

### 2. 爬虫模式

```javascript
// webpack.config.js
new ApiTrackerPlugin({
  mode: 'crawler',
  crawler: {
    baseUrl: 'http://localhost:3000',
    paths: ['/api/**']
  }
})
```

### 3. CI/CD 集成

```yaml
# .github/workflows/api-track.yml
- name: Track API Changes
  run: npm run build
  
- name: Compare API Contracts
  run: npx api-tracker compare
  
- name: Report Changes
  run: npx api-tracker report
```

## 🔧 运行时集成

### 在应用中启用通知气泡

```javascript
// main.js
import { enableApiChangeNotifications } from 'webpack-api-tracker-plugin/runtime';

if (process.env.NODE_ENV === 'development') {
  enableApiChangeNotifications();
}
```

## 📊 查看报告

构建完成后，会生成 API 变更报告：

```bash
open .api-tracker/report.html
```

报告包含：
- ✅ API 契约变更概览
- ✅ 新增/删除的接口
- ✅ 参数变更详情
- ✅ 响应结构变更
- ✅ 兼容性分析

## 💡 常见问题

### Q: 如何禁用插件？

```javascript
new ApiTrackerPlugin({
  enabled: false
})
```

### Q: 如何排除某些路径？

```javascript
crawler: {
  baseUrl: 'http://localhost:3000',
  paths: ['/api/**'],
  exclude: ['/api/internal/**']
}
```

### Q: 如何自定义输出路径？

```javascript
outputPath: 'custom/api-tracker-output'
```

## 📚 更多文档

- [功能特性](./features.md) - 所有功能详解
- [配置选项](./index.md#配置选项) - 配置详细说明
- [更新日志](./changelog.md) - 版本更新记录
- [真实项目验证](./validation-report.md) - 验证报告