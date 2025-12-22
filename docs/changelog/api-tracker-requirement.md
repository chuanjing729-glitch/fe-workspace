# api-tracker-plugin 核心方案设计需求文档

## 1. 概述

### 1.1 目的
本文档旨在定义 api-tracker-plugin 工具的需求，该工具目标是作为接口契约的"看门人"，负责数据的同步、清洗、脱敏与变动分析，与 coverage-plugin 协同工作，提供完整的质量保障解决方案。

### 1.2 范围
本工具将独立运行，专注于接口契约管理，同时通过配置方式与 coverage-plugin 进行联动，实现API变更对代码覆盖率的智能影响分析。

## 2. 功能需求

### 2.1 核心链路架构

#### 2.1.1 数据采集层 (Data Collection Layer)
- OpenAPI 模式：通过 Token 直接调取 JSON
- Crawler 模式：通过 Puppeteer + SSO Cookie 爬取（解决内网鉴权问题）

#### 2.1.2 数据处理层 (Data Processing Layer)
- 安全隔离机制：实现代码逻辑与敏感数据的物理分离
- 智能 Diff 引擎：对比新旧 Schema，识别 Breaking Changes 和 Minor Changes
- 合约指纹生成：为每个接口生成 md5 指纹，用于版本校验

#### 2.1.3 数据输出层 (Data Output Layer)
- 生成 API 快照文件 (.api-tracker/api-snapshot.json)
- 生成差异报告 (diff-report.json)
- 提供与其他插件的通信接口

### 2.2 关键细节设计

#### 2.2.1 多模式数据采集
- **OpenAPI 模式**：
  - 支持通过配置 Token 直接访问 OpenAPI JSON
  - 支持多种认证方式（Bearer Token、API Key等）
  - 支持定时轮询更新
  
- **Crawler 模式**：
  - 集成 Puppeteer 实现网页爬取
  - 支持 SSO Cookie 鉴权
  - 支持复杂页面结构的数据提取

#### 2.2.2 安全隔离机制
- **三层配置架构**：
  - 逻辑层：插件源代码（GitHub/NPM 公开）
  - 项目层：基础配置（项目ID、文件路径规则）（Git 内部仓库）
  - 凭证层：敏感信息（Token, Cookie, Domain）（GitIgnore，绝不上传）

- **配置加载逻辑**：
  - 优先级：凭证层 > 项目层 > 逻辑层
  - 安全加载：通过 try-catch 保护敏感配置加载
  - 环境变量支持：支持从环境变量读取敏感信息

#### 2.2.3 智能 Diff 引擎
- **变动分级**：
  - Level 1 (Breaking)：删除字段、修改字段类型、增加必填字段
  - Level 2 (Warning)：增加非必填字段、修改描述、修改 Mock 示例
  
- **语义化对比**：
  - 基于 json-schema-diff-node 库实现
  - 支持复杂的嵌套结构对比
  - 提供详细的变动描述和位置信息

#### 2.2.5 合约指纹机制
- 为每个接口生成唯一的 md5 指纹
- 指纹包含接口路径、方法、参数、响应结构等关键信息
- 支持指纹版本管理和历史追踪
- 提供指纹对比功能，用于检测接口变更

## 3. 技术实现路线

### 3.1 第一阶段：安全基建与原型搭建
- 实现三层配置架构
- 实现配置加载器（Config Loader）
- 验证 .local.js 隔离方案有效性
- 发布 alpha 版到私有 npm

### 3.2 第二阶段：数据采集与处理
- 实现 OpenAPI 模式数据采集
- 实现 Crawler 模式数据采集
- 实现智能 Diff 引擎核心逻辑
- 实现合约指纹生成机制

### 3.3 第三阶段：插件协同与集成
- 实现与 coverage-plugin 的文件级通信
- 实现 API 变更通知机制
- 实现差异报告生成功能
- 完善文档和示例

## 4. 非功能需求

### 4.1 性能要求
- 数据采集时间不超过 30 秒
- Diff 计算时间不超过 10 秒
- 内存占用合理，不影响开发体验

### 4.2 兼容性要求
- 支持主流 YApi 版本
- 支持多种认证方式
- 支持 Windows、macOS、Linux 操作系统

### 4.3 安全性要求
- 敏感信息不上传到任何远程服务器
- 支持企业级安全合规要求
- 提供安全审计日志

## 5. 验收标准

### 5.1 功能验收标准
- 能够正确采集和处理 API 数据
- 能够准确识别 API 变动并分级
- 能够生成合约指纹并进行版本管理
- 能够与 coverage-plugin 协同工作
- 提供完整的安全隔离机制

### 5.2 功能详细要求

#### 5.2.1 数据采集要求
- 支持 OpenAPI v2/v3 格式
- 支持 YApi 平台数据采集
- 支持定时任务和手动触发两种方式
- 提供采集状态监控和错误处理

#### 5.2.2 Diff 分析要求
- 准确识别 Breaking Changes 和 Minor Changes
- 提供详细的变动描述和位置信息
- 支持批量接口的差异分析
- 提供差异报告导出功能

#### 5.2.3 安全配置要求
- 实现三层配置架构
- 支持凭证层文件的 GitIgnore
- 提供安全加载机制
- 支持环境变量配置

#### 5.2.4 插件协同要求
- 支持通过配置文件与 coverage-plugin 通信
- 提供 API 变更通知机制
- 支持覆盖率数据重置功能
- 提供协同工作流文档

### 5.3 性能验收标准
- 数据采集时间不超过 30 秒
- Diff 计算时间不超过 10 秒
- 内存占用峰值不超过 500MB
- CPU 使用率峰值不超过 80%

### 5.4 部署验收标准
- 易于集成到现有项目中
- 提供清晰的配置文档
- 支持 npm 安装和使用
- 提供完整的使用示例

## 6. 配置选项

### 6.1 基础配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| enabled | boolean | `true` | 是否启用插件 |
| mode | string | `'openapi'` | 数据采集模式 ('openapi' \| 'crawler') |
| snapshotPath | string | `'./.api-tracker/api-snapshot.json'` | API 快照文件路径 |
| diffReportPath | string | `'./.api-tracker/diff-report.json'` | 差异报告文件路径 |

### 6.2 OpenAPI 模式配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| openapi.url | string | `''` | OpenAPI JSON 地址 |
| openapi.token | string | `''` | 认证 Token |
| openapi.authType | string | `'bearer'` | 认证类型 ('bearer' \| 'apikey') |
| openapi.pollingInterval | number | `300000` | 轮询间隔（毫秒） |

### 6.3 Crawler 模式配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| crawler.url | string | `''` | YApi 页面地址 |
| crawler.cookie | string | `''` | SSO Cookie |
| crawler.selector | string | `''` | 数据选择器 |
| crawler.headless | boolean | `true` | 是否无头模式运行 |

### 6.4 安全配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| security.configPath | string | `'./.api-tracker/config.js'` | 项目层配置文件路径 |
| security.localConfigPath | string | `'./.api-tracker/config.local.js'` | 凭证层配置文件路径 |
| security.allowEnvVars | boolean | `true` | 是否允许环境变量配置 |

### 6.5 协同配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| collaboration.enabled | boolean | `true` | 是否启用协同功能 |
| collaboration.coveragePluginPath | string | `'./node_modules/coverage-plugin'` | 覆盖率插件路径 |
| collaboration.onApiChange | string | `'warn'` | API 变更时的行为 ('reset' \| 'warn') |
| collaboration.notifyCoveragePlugin | boolean | `true` | 是否通知覆盖率插件 |

## 7. 与其他插件的协同

### 7.1 独立运行模式
api-tracker-plugin 可以独立运行，不依赖其他插件，提供完整的 API 数据采集和分析功能。

### 7.2 联动运行模式
当与 coverage-plugin 配合使用时，可以通过配置实现以下功能：
- 自动通知 API 变更
- 触发覆盖率数据重置
- 在覆盖率报告中显示 API 变更影响
- 提供完整的质量保障工作流

## 8. 安全与隐私

### 8.1 数据存储
- 所有 API 数据仅在本地存储
- 不会上传到任何远程服务器
- 生成的快照和报告仅保存在本地文件系统中

### 8.2 敏感信息处理
- 敏感信息（Token、Cookie）通过凭证层配置隔离
- 支持从环境变量读取敏感信息
- 提供敏感信息加密存储选项

### 8.3 安全审计
- 提供配置加载日志
- 提供数据采集日志
- 提供安全事件审计功能

## 9. 文档要求

### 9.1 README 文档
- 提供项目概述和核心功能介绍
- 包含安装和使用指南
- 提供详细的 API 文档和使用示例
- 包含贡献指南和许可证信息

### 9.2 API 文档
- 为插件配置选项提供详细的说明文档
- 包含使用示例和配置选项说明
- 提供 Webpack 集成指南
- 支持 TypeScript 类型提示

### 9.3 使用示例
- 提供完整的 Webpack 配置使用示例
- 包含常见场景的解决方案
- 提供最佳实践指导
- 包含错误处理示例

### 9.4 更新日志
- 遵循标准的 CHANGELOG 格式
- 记录每个版本的功能新增、bug修复和破坏性变更
- 提供升级指南和兼容性说明

## 10. 发布和版本管理

### 10.1 版本规范
- 遵循语义化版本规范（SemVer）
- 主版本号：不兼容的API修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

### 10.2 发布流程
- 自动化测试通过后才能发布
- 发布前进行代码审查
- 确保文档和示例代码更新完毕
- 提供详细的更新日志

### 10.3 npm 包管理
- 发布到 npm 公共仓库 (@51jbs/api-tracker-plugin)
- 支持 CDN 引入 (unpkg, jsDelivr)
- 提供 UMD、ES Module、CommonJS 等多种格式
- 包含完整的类型定义文件 (index.d.ts)
- 支持 tree-shaking 优化
- 提供 package.json 元数据（keywords, homepage, repository, bugs等）
