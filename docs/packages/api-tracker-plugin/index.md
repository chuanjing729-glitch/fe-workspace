---
title: api-tracker-plugin
order: 1
editLink: true
---

# @51jbs/api-tracker-plugin

> 📡 **API 契约守卫**: 自动化的 API 生命周期追踪与变更预警系统，确保前后端契约的一致性。

`@51jbs/api-tracker-plugin` 是一款专为 Webpack 环境设计的 API 治理插件。它能够自动采集项目中的异步接口调用（支持 Axios 等），生成 API 契约指纹，并在构建阶段实时检测接口定义的破坏性变更（Breaking Changes）。

## ✨ 核心特性

- **🔍 自动指纹采集**: 深度识别项目中的 Restful API 调用，自动生成参数结构与返回类型的指纹（Fingerprint）。
- **📊 多维变更分析**: 
    - **契约对比 (Diff)**: 实时对比当前代码与基线/OpenAPI 定义的差异。
    - **破坏性变更预警**: 自动识别字段删除、类型变更等高风险改动。
- **📋 OpenAPI 深度集成**: 支持将采集到的 API 导出为标准 OpenAPI 3.0 文档，或通过 Swagger 定义反向校验代码。
- **🤝 团队协作治理**: 集成协作管理模块，支持多分支 API 状态合并与冲突预警。
- **💻 运行时看板 (UI)**: 提供集成在开发环境中的气泡 UI，直观展示当前页面的接口健康度。

## 📦 安装

```bash
pnpm add -D @51jbs/api-tracker-plugin
```

## 🚀 快速接入

### Webpack 配置

```javascript
const ApiTrackerPlugin = require('@51jbs/api-tracker-plugin');

module.exports = {
  plugins: [
    new ApiTrackerPlugin({
      // 采集范围
      include: ['src/api/**/*.ts'],
      
      // 导出 OpenAPI 文档路径
      openapi: {
        output: './docs/api-spec.yaml',
        format: 'yaml'
      },
      
      // 开启变更预警看板
      enableUI: true
    })
  ]
};
```

## 🛠 配置选项 (Options)

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `true` | 是否开启插件。 |
| `include` | `string[]` | `[]` | 包含的文件范围。 |
| `exclude` | `string[]` | `['node_modules']` | 排除的文件范围。 |
| `enableUI` | `boolean` | `true` | 是否在开发环境注入看板 UI。 |
| `openapi` | `object` | `{}` | OpenAPI 导出配置。 |

## 📝 许可证

MIT