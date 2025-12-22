
本指南将帮助你快速在 Webpack 项目中接入增量覆盖率插件。

## 📦 安装

在项目根目录下运行：

```bash
npm install @51jbs/incremental-coverage-plugin --save-dev
# 或者
pnpm add @51jbs/incremental-coverage-plugin -D
```

## 🚀 接入配置

### 1. Webpack 项目

在你的 `webpack.config.js` 中添加插件配置：

```javascript
const { WebpackIncrementalCoveragePlugin } = require('@51jbs/incremental-coverage-plugin/webpack');

module.exports = {
  // ... 其他配置
  plugins: [
    new WebpackIncrementalCoveragePlugin({
      // 需要包含的文件（glob 模式）
      include: ['src/**/*.{js,ts,vue}'],
      // Git 对比的基准分支（或 commit hash）
      gitDiffBase: 'main', 
      // 增量覆盖率达标阈值 (%)
      threshold: 80,
    })
  ]
};
```

### 2. Vite 项目 (实验性)

> ⚠️ 注意：Vite 支持目前处于实验阶段，仅推荐在开发环境下预览。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { ViteIncrementalCoveragePlugin } from '@51jbs/incremental-coverage-plugin/vite';

export default defineConfig({
  plugins: [
    ViteIncrementalCoveragePlugin({
      include: ['src/**'],
      gitDiffBase: 'main'
    })
  ]
});
```

## 📊 使用流程

1. **环境准备**: 确保当前项目是一个 Git 仓库，且你有改动尚未提交（或相对于基准分支有差异）。
2. **启动服务**: 运行 `npm run dev`（或你的 Webpack 启动指令）。
3. **交互自测**: 在浏览器中操作受影响的页面功能。
4. **查看报告**:
   - 插件会在控制台输出即时的增量覆盖率统计。
   - 默认会在根目录下的 `.coverage/` 文件夹生成 `latest.html`。
   - 直接在浏览器打开该文件查看可视化的增量覆盖情况。

## 📁 产物说明

运行后，`.coverage/` 目录结构如下：

```text
.coverage/
├── baseline.json              # 基准覆盖率数据
├── latest.html                # 最新的增量报告视图
├── coverage-report-TIMESTAMP.html  # 带时间戳的历史报告
└── coverage-report-TIMESTAMP.json  # 结构化数据（便于 CI 集成）
```
