# 通用前端覆盖率插件 (Universal Coverage Plugin)

> 🚀 **3.0 架构升级**: 基于 Unplugin 的通用架构，同时支持 Webpack, Vite 和 Rspack。

本插件用于在开发阶段收集代码覆盖率，并生成增量自测报告。即时反馈变更影响，提升前端研发质量。

## ✨ 核心特性

- **🌍 多构建工具支持**: 一套代码，同时支持 Webpack 4/5, Vite, Rspack。
- **🔍 增量覆盖率**: 基于 Git Diff 和运行时数据，精准计算变更代码的覆盖率。
- **📊 分层报告 (Reporter 2.0)**: 
    - 全新 Dashboard 视图
    - 交互式图表 (Chart.js)
    - 影响面分析 (Impact Analysis)
    - **💻 环境信息**: 集成 Git (分支/提交人)、硬件 (CPU/内存) 及浏览器信息
- **⚡️ 高性能分析**: 内置 AST 缓存 (SHA-256)，大幅提升二次构建速度。
- **🧩 影响面自动识别**: 自动分析代码依赖，识别受影响的页面和组件。
- **🛠 开发者友好**: 
    - 运行时悬浮气泡 (Overlay)
    - 快捷键操作 (Ctrl+Shift+C)

## 📚 文档

- [**技术架构文档 (Architecture & Design)**](./TECHNICAL_DOC.md): 包含架构图、时序图及核心流程说明。
- [**变更日志 (Changelog)**](./CHANGELOG.md): 版本更新记录。

## 📦 安装

```bash
npm install @51jbs/webpack-coverage-plugin --save-dev
```

## 🚀 快速开始

### 1. 接入配置

#### Webpack
```javascript
// webpack.config.js
const { WebpackCoveragePlugin } = require('@51jbs/webpack-coverage-plugin');

module.exports = {
  plugins: [
    new WebpackCoveragePlugin({
      enabled: process.env.ENABLE_SELF_TEST === 'true',
      include: ['src/**/*.{js,ts,jsx,tsx,vue}'],
    })
  ]
};
```

#### Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import coverage from '@51jbs/webpack-coverage-plugin/vite';

export default defineConfig({
  plugins: [
    coverage({
      enabled: process.env.ENABLE_SELF_TEST === 'true',
      include: ['src/**/*.{js,ts,jsx,tsx,vue}'],
    })
  ]
});
```

#### Rspack
```javascript
// rspack.config.js
const { rspackCoveragePlugin } = require('@51jbs/webpack-coverage-plugin/rspack');

module.exports = {
  plugins: [
    rspackCoveragePlugin({
      enabled: process.env.ENABLE_SELF_TEST === 'true',
      include: ['src/**/*.{js,ts,jsx,tsx,vue}'],
    })
  ]
};
```

### 2. 配置选项 (Options)

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | `false` | 是否启用插件。建议仅在开发环境开启。 |
| `include` | `string[]` | `[]` | 需要插桩的文件 glob 模式。 |
| `exclude` | `(string\|RegExp)[]` | `[/node_modules/, /\.test\./]` | 排除的文件模式。 |
| `outputDir` | `string` | `.coverage` | 报告输出目录。 |
| `enableImpactAnalysis` | `boolean` | `true` | 是否启用影响面分析（依赖分析）。 |
| `enableOverlay` | `boolean` | `true` | 是否启用浏览器端悬浮气泡 UI。 |

### 3. 开发流程

1. **启动开发服务**:
   ```bash
   ENABLE_SELF_TEST=true npm run dev
   ```

2. **进行自测**:
   在浏览器中操作页面，插件会自动收集运行时覆盖率。

3. **生成报告**:
   - 点击页面右下角的悬浮气泡
   - 或按快捷键 `Ctrl+Shift+C`
   
   插件将生成 `smart-test-report.html` 并自动计算增量覆盖率。

## ⚙️ 架构设计

本插件采用 **Universal Plugin Architecture**：

- **Core**: 平台无关的核心逻辑 (`CoveragePluginCore`)。
- **Adapters**: 适配不同构建工具 (`Unplugin`, `ViteCoveragePlugin`, `WebpackCoveragePlugin`)。
- **Infrastructure**: HTTP服务, 文件存储, 报告渲染.

详情请参阅 [TECHNICAL_DOC.md](./TECHNICAL_DOC.md)。

## 📝 贡献

欢迎提交 Issue 和 PR。

## 📄 许可证

MIT
