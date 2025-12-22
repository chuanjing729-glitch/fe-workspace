---
title: spec-plugin
order: 1
editLink: true
---

# @51jbs/spec-plugin

> 🛡 **前端工程规范守卫**: 基于 Webpack 的深度规范检查工具，从命名规范到运行时安全，全方位保障代码质量。

`@51jbs/spec-plugin` 是一款专为企业级前端项目设计的工程规范检查插件。它不仅关注传统的 Lint 问题，更深入业务场景，提供包括 **BEM 命名校验**、**空安全防护**、**内存泄漏检测** 以及 **性能预算审计** 在内的 20+ 项核心检查规则。

## ✨ 核心特性

- **🚀 极速增量检查**: 默认采用增量模式，仅针对 Git 变更文件进行校验，毫秒级反馈。
- **📊 20+ 深度校验规则**:
    - **规范类**: BEM 校验、文件命名规范、变量命名对齐。
    - **安全类**: 空安全检查 (Optional Chaining)、API 安全调用、XSS 防护。
    - **性能类**: 图片及静态资源体积审计、JS/CSS 预算监控。
    - **架构类**: 模块边界控制 (Boundary Check)、依赖关系合法性检查。
- **🎯 存量代码基线 (Baseline)**: 支持通过基线机制忽略存量问题，让规范治理能够灰度落地。
- **� 多维报表展示**: 提供详细的终端 Console 报告及交互式 HTML 可视化看板。

## 📦 安装

```bash
pnpm add -D @51jbs/spec-plugin
```

## 🚀 快速接入

### Webpack 配置

```javascript
const SpecPlugin = require('@51jbs/spec-plugin');

module.exports = {
  plugins: [
    new SpecPlugin({
      // 检查模式：'incremental' (增量) | 'full' (全量)
      mode: 'incremental',
      
      // 性能预算
      performanceBudget: {
        maxImageSize: 500, // KB
        maxJsSize: 300     // KB
      },
      
      // 启用基线机制 (忽略存量)
      useBaseline: true,
      
      // 是否生成 HTML 报告
      htmlReport: true
    })
  ]
};
```

## � 配置选项 (Options)

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `string` | `'incremental'` | 检查模式：`incremental` 或 `full`。 |
| `severity` | `string` | `'normal'` | 严重级别。`strict` 会在有错误或警告时中断构建。 |
| `useBaseline` | `boolean` | `false` | 是否启用基线文件，忽略存量已知问题。 |
| `htmlReport` | `boolean` | `true` | 是否生成可视化 HTML 报告。 |
| `exclude` | `string[]` | `['node_modules', ...]` | 排除的文件范围。 |

## 📝 许可证

MIT