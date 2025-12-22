# 增量覆盖率插件 (Incremental Coverage Plugin)

> 🎯 **核心目标**: 精准追踪代码变更后的覆盖率情况，为研发自测提供量化数据支撑。

本插件基于 `babel-plugin-istanbul` 和 `istanbul-diff`，通过集成 Git 差异分析，自动计算自测过程中的增量覆盖率。

## ✨ 核心价值

- **🚀 聚焦变更**: 告别冗长的全量覆盖率报告，核心关注你改动的那几行代码。
- **🛡 质量契约**: 设置增量覆盖率阈值，作为代码合并与上线的硬性质量指标。
- **🔗 一站式集成**: 深度集成 Git，自动解析 Diff 提取新增行号，无需手动干预。
- **🔋 生产就绪**: 具备防抖上报、故障重试及报告自动清理机制，保障构建链路稳定。

## 🏗️ 核心模块

| 模块 | 职责 |
|------|------|
| **CoverageCollector** | 负责浏览器端数据的收集与内存合并 |
| **CoverageDiffer** | 使用 istanbul-diff 计算基准与当前的差异 |
| **GitService** | 自动提取 Git Diff 变更行号 |
| **CoverageReporter** | 生成可视化 HTML 报告与 JSON 结构化数据 |

## 📚 快速导航

- [**快速开始**](./docs/quick-start.md): 3 分钟完成 Webpack 项目接入。
- [**功能特性**](./docs/features.md): 深入了解增量计算与生产级保护机制。
- [**技术架构**](./docs/architecture.md): 查看整体设计方案与时序图。
- [**API 参考**](./docs/api.md): 查看详细的配置项说明。

---

## 📄 许可证

本项目采用 [MIT](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/incremental-coverage-plugin/LICENSE) 许可证发布。
