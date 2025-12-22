# 前端工程效率平台

![License](https://img.shields.io/badge/license-MIT-blue.svg)

前端工程效率平台是一套完整的前端开发工具集，包含多个高质量的工具库和插件，旨在提升开发效率和代码质量。

## 工具列表

### Core Utils 核心工具库
通用的前端工具函数集合，包含数组操作、DOM 操作、数据校验、格式化工具等。

### Vue2 Toolkit
专为 Vue2 应用设计的工具库，提供了常用的指令和 Mixins 来提升开发效率。

### Spec Plugin (工程规范助手)
集成在 Webpack 构建流程中的代码质量检查工具。

### Coverage Plugin (覆盖率助手)
用于在开发阶段收集代码覆盖率并生成增量自测报告的 Webpack 插件。

### API Tracker Plugin (API 契约守卫)
用于跟踪 API 契约变化并在开发阶段提供实时通知的 Webpack 插件。该插件作为接口契约的"看门人"，负责数据的同步、清洗、脱敏与变动分析，并与 `coverage-plugin` 协同工作，提供完整的质量保障解决方案。

## 安装

```bash
# 克隆仓库
git clone <repository-url>

# 安装依赖
pnpm install
```

## 使用

```bash
# 启动文档站点
pnpm docs:dev

# 构建所有包
pnpm build

# 运行所有测试
pnpm test
```

## 许可证

MIT
