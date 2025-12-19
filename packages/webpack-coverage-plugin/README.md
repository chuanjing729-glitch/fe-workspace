# Webpack Coverage Plugin (Smart Testing Edition)

> 🚀 **V2.0 Architecture Refactor**: Clean Architecture, Caching, and Enterprise-Grade Reporting.

Webpack 插件用于在开发阶段收集代码覆盖率，并生成增量自测报告。即时反馈变更影响，提升前端研发质量。

## ✨ 核心特性

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
- **🏗 整洁架构**: 分离 Core, Service, Infrastructure 层，易于扩展及维护。

## 📚 文档

- [**技术架构文档 (Architecture & Design)**](./TECHNICAL_DOC.md): 包含架构图、时序图及核心流程说明。
- [**变更日志 (Changelog)**](./CHANGELOG.md): 版本更新记录。

## 📦 安装

```bash
npm install @51jbs/webpack-coverage-plugin --save-dev
```

## 🚀 快速开始

### 1. Webpack 配置

```javascript
const { WebpackCoveragePlugin } = require('@51jbs/webpack-coverage-plugin');

module.exports = {
  // ...
  plugins: [
    new WebpackCoveragePlugin({
      // 仅在开发模式或特定环境变量下启用
      enabled: process.env.ENABLE_SELF_TEST === 'true',
      
      // 包含的文件模式
      include: ['src/**/*.{js,ts,jsx,tsx,vue}'],
      
      // 排除的文件
      exclude: [/node_modules/, /\.test\./],
      
      // 报告输出目录
      outputDir: '.coverage',
      
      // 质量门禁配置
      qualityGate: {
        lineCoverageThreshold: 80 // 增量行覆盖率阈值
      }
    })
  ]
};
```

### 2. 开发流程

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

本插件采用 **Clean Architecture**：

- **Core**: 定义核心接口 (`IGitService`, `ICoverageService`).
- **Services**: 业务逻辑实现 (Git操作, 覆盖率计算, 影响面分析).
- **Infrastructure**: HTTP服务, 文件存储, 报告渲染.

详情请参阅 [TECHNICAL_DOC.md](./TECHNICAL_DOC.md)。

## 📝 贡献

欢迎提交 Issue 和 PR。

## 📄 许可证

MIT
