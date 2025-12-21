# Incremental Coverage Plugin

**轻量级增量覆盖率插件** - 基于 babel-plugin-istanbul 和 istanbul-diff

## ✨ 特性

- ✅ **业界标准**: 使用 `babel-plugin-istanbul` 进行代码插桩
- ✅ **增量计算**: 基于 `istanbul-diff` 计算项目变更行覆盖率
- ⚠️ **Webpack 支持**: 完整实现（支持 HMR、增强上报、报告清理）
- 🚧 **Vite 支持**: 开发中（目前仅支持 Webpack 链路）
- ✅ **Git 集成**: 精确解析 Git Diff 提取新增行号
- ✅ **生产就绪**: 具备防抖上报、故障重试、报告自动清理及优雅退出保护
- ✅ **精美报告**: 生成带时间戳的历史报告及 `latest.html` 视图

## 📦 安装

```bash
npm install @51jbs/incremental-coverage-plugin --save-dev
```

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

## 📁 输出文件

运行后会在 `.coverage/` 目录生成以下文件：

```
.coverage/
├── baseline.json              # Baseline 覆盖率（首次运行时生成）
├── latest.html                # 最新的 HTML 报告
├── coverage-report-*.html     # 历史报告
└── coverage-report-*.json     # JSON 格式报告（如果启用）
```
