# coverage-plugin 文档

欢迎使用 coverage-plugin！这是一个用于在开发阶段收集代码覆盖率并生成增量自测报告的 Webpack 插件。

## 目录

1. [快速开始](../README.md)
2. [配置选项](../README.md#配置选项)
3. [报告生成功能](./reports.md)

## 功能概述

coverage-plugin 提供以下核心功能：

- **动态插桩**：在 DevServer 启动时对代码进行插桩
- **实时收集**：收集运行时的代码覆盖率数据
- **增量报告**：与 Git Diff 结合，生成增量自测报告
- **开发者友好**：提供悬浮控制台和快捷键操作
- **报告生成**：自动生成 HTML 和 Markdown 格式的自测报告

## 兼容性

- Webpack 4.x 和 5.x
- Vue 2.x 项目
- 支持 CommonJS 和 ES Module
- TypeScript 类型支持

## 许可证

MIT