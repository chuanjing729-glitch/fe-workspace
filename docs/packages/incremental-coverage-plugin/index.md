---
title: incremental-coverage-plugin
order: 1
editLink: true
---

# Incremental Coverage Plugin

**轻量级增量覆盖率插件** - 基于 babel-plugin-istanbul 和 istanbul-diff

[![npm version](https://img.shields.io/npm/v/@51jbs/incremental-coverage-plugin.svg)](https://www.npmjs.com/package/@51jbs/incremental-coverage-plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ 特性

- ✅ **业界标准**: 使用 `babel-plugin-istanbul` 进行代码插桩
- ✅ **增量计算**: 基于 `istanbul-diff` 计算项目变更行覆盖率
- ⚠️ **Webpack 支持**: 完整实现（支持 HMR、增强上报、报告清理）
- 🚧 **Vite 支持**: 开发中（目前仅支持 Webpack 链路）
- ✅ **Git 集成**: 精确解析 Git Diff 提取新增行号
- ✅ **生产就绪**: 具备防抖上报、故障重试、报告自动清理及优雅退出保护
- ✅ **精美报告**: 生成带时间戳的历史报告及 `latest.html` 视图

---

## 📦 安装

```bash
npm install @51jbs/incremental-coverage-plugin --save-dev
```

---

## 🚀 快速开始

### Webpack 项目

```javascript
// webpack.config.js
const { WebpackIncrementalCoveragePlugin } = require('@51jbs/incremental-coverage-plugin/webpack');

module.exports = {
  plugins: [
    new WebpackIncrementalCoveragePlugin({
      include: ['src/**'],
      gitDiffBase: 'main',
      threshold: 80,
    })
  ]
};
```

---

## ⚙️ 配置选项

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `include` | `string[]` | `['src/**']` | 需要包含的文件（glob 模式） |
| `exclude` | `string[]` | `['**/node_modules/**']` | 需要排除的文件 |
| `gitDiffBase` | `string` | `'main'` | Git 对比的基准分支 |
| `threshold` | `number` | `80` | 增量覆盖率阈值 |
| `reportInterval` | `number` | `10000` | 报告生成最小间隔 (ms) |
| `historyCount` | `number` | `15` | 保留的历史报告数量 |
| `outputDir` | `string` | `'.coverage'` | 报告输出目录 |
| `reportFormat` | `'html'\|'json'\|'both'` | `'html'` | 报告格式 |

---

## 📊 工作原理

```
1. 代码插桩
   ↓ (babel-plugin-istanbul)
2. 浏览器执行并收集覆盖率
   ↓ (window.__coverage__)
3. 上报到插件
   ↓
4. 合并覆盖率数据
   ↓ (CoverageCollector)
5. 计算增量覆盖率
   ↓ (istanbul-diff + Git diff)
6. 生成报告
   ↓ (HTML / JSON)
7. 输出结果
```

---

## 📁 输出文件

运行后会在 `.coverage/` 目录生成以下文件：

```
.coverage/
├── baseline.json              # Baseline 覆盖率（首次运行时生成）
├── latest.html                # 最新的 HTML 报告
├── coverage-report-*.html     # 历史报告
└── coverage-report-*.json     # JSON 格式报告（如果启用）
```

---

## 🎨 报告示例

HTML 报告包含：
- 📊 整体覆盖率统计
- 📁 文件级别的覆盖率详情
- 🎯 未覆盖行的具体位置
- ✅ 通过/失败状态

---

## 🏗️ 架构设计

本插件采用模块化设计，职责清晰：

- **Plugin**: 主控制器，协调各模块
- **CoverageCollector**: 收集和合并覆盖率数据
- **CoverageDiffer**: 使用 istanbul-diff 计算增量
- **CoverageReporter**: 生成 HTML/JSON 报告
- **GitService**: Git 集成，获取变更信息

详细架构文档请查看 [docs/architecture_zh.md](./architecture_zh.md)

---

## 🔧 开发

```bash
# 安装依赖
npm install

# 构建
npm run build

# 开发模式（监听文件变化）
npm run dev

# 运行测试
npm test

# 类型检查
npm run typecheck
```

---

## 📚 文档

- [技术架构文档](./architecture_zh.md) - 详细的架构设计和实现原理
- [API 文档](./api.md) - 完整的 API 参考（待补充）
- [开发指南](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/incremental-coverage-plugin/docs/development.md) - 如何参与开发（待补充）

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

在提交 PR 前，请确保：
- ✅ 代码通过 TypeScript 类型检查
- ✅ 添加了必要的测试
- ✅ 更新了相关文档

---

## 📄 许可证

[MIT](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/incremental-coverage-plugin/LICENSE)

---

## 🙏 致谢

本项目基于以下优秀的开源项目：

- [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul) - 代码插桩
- [istanbul-diff](https://github.com/istanbuljs/istanbul-diff) - 增量覆盖率计算
- [unplugin](https://github.com/unjs/unplugin) - 统一的插件接口
- [simple-git](https://github.com/steveukx/git-js) - Git 操作

---

## 📞 联系方式

- 作者: chuanjing729
- 仓库: [GitHub](https://github.com/chuanjing729-glitch/fe-workspace)
- 问题反馈: [Issues](https://github.com/chuanjing729-glitch/fe-workspace/issues)

---

**让测试覆盖率变得简单高效！** 🚀
