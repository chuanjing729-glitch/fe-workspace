# 前端工程效率平台

[![Documentation](https://img.shields.io/badge/documentation-online-blue)](https://chuanjing729-glitch.github.io/fe-workspace/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

这是一个用于提升前端开发质量、效率和性能的统一工作空间，集成了代码规范检查、前端工具库和完整的开发规范文档。

## 🌐 在线文档

访问我们的在线文档获取完整的使用指南和规范说明：
https://chuanjing729-glitch.github.io/fe-workspace/

## 📁 目录结构

```
fe-workspace/
├── packages/                     # 前端工具包
│   ├── core-utils/               # 核心工具库
│   ├── vue2-toolkit/             # Vue2 工具库
│   └── webpack-spec-plugin/      # Webpack 规范检查插件
├── docs/                         # 统一文档管理目录
├── scripts/                      # 脚本目录
├── package.json                  # 工作空间根配置
├── pnpm-workspace.yaml           # pnpm工作空间配置
└── README.md                     # 工作空间说明文档
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 启动文档站点

```bash
pnpm docs:dev
```

访问 http://localhost:5173/fe-workspace/ 查看文档站点。

### 构建文档

```bash
pnpm docs:build
```

## 📦 前端工具包

### Core Utils 核心工具库

纯JS工具库，框架无关，提供深拷贝、日期、数字精确计算等核心功能。

#### 🚀 快速使用

```javascript
import { deepClone, add, formatDate, maskPhone, local } from '@51jbs/core-utils'

// 深拷贝（支持循环引用）
const copy = deepClone(data)

// 精确数字计算
const result = add(0.1, 0.2)  // 0.3

// 日期格式化
const dateStr = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')

// 手机号脱敏
const masked = maskPhone('13800138000')  // 138****8000

// 本地存储
local.set('user', { name: 'test' })
const user = local.get('user')
```

#### 🎯 解决的问题

| 问题 | 解决方案 |
|------|---------|
| **64处不安全的深拷贝** | `deepClone()` 替代 `JSON.parse(JSON.stringify())` |
| **浮点数精度问题** | `add/subtract/multiply/divide()` 精确计算 |
| **日期格式化重复** | `formatDate()` 统一格式化 |
| **数据脱敏不统一** | `maskPhone/maskEmail/maskIdCard()` |
| **存储操作繁琐** | `local/session/storage` 封装 |
| **数组操作复杂** | `unique/groupBy/shuffle/sum` 等丰富数组工具 |
| **表单验证重复** | `isPhone/isEmail/validatePassword` 统一验证 |
| **设备检测困难** | `isMobile/isIOS/isWechat` 一键检测 |

#### 📊 功能统计

- **2000+行**源码
- **13个模块**（object、number、date、string、storage、array、url、validation、device、dom、format、event、http）
- **100+个函数**

### Vue2 Toolkit

Vue2专用工具库，提供统一的消息提示、指令、mixins等。

#### 🚀 快速使用

```javascript
// 全量引入
import Vue from 'vue'
import Vue2Toolkit from '@51jbs/vue2-toolkit'

Vue.use(Vue2Toolkit)

// 按需引入
import { messagePlugin, debounceDirective } from '@51jbs/vue2-toolkit'

// 使用消息提示插件
Vue.use(messagePlugin)

// 注册防抖指令
Vue.directive('debounce', debounceDirective)
```

#### 🎯 解决的问题

| 问题 | 解决方案 |
|------|---------|
| **127处消息提示不一致** | `messagePlugin` 统一消息提示方式 |
| **重复点击导致重复请求** | `v-debounce` 防抖指令 |
| **高频事件性能问题** | `v-throttle` 节流指令 |
| **手动管理事件监听器** | `eventManager` mixin 自动清理 |
| **定时器内存泄漏** | `timerManager` mixin 自动清理 |
| **权限控制代码重复** | `v-permission` 指令和 `permissionManager` mixin |
| **图片加载性能问题** | `v-lazy` 懒加载指令 |
| **Observer 管理复杂** | `observerManager` mixin 自动清理 |

#### 📊 功能统计

- **9个指令**（防抖、节流、剪贴板、权限、懒加载、聚焦、拖拽、尺寸监听）
- **4个Mixins**（事件管理、定时器管理、权限管理、Observer管理）
- **1个插件**（消息提示）
- **500+行**源码

### Webpack 规范检查插件

Webpack plugin for checking code specifications including naming, performance, and best practices.

#### ✨ 特性

##### 📝 **代码规范检查** - 57 项全面检查
- 🎨 **Vue2 规范检查** - 13 项专项检查（组件命名、Props、生命周期等）
- 🔧 **JavaScript 规范检查** - 8 项语法检查（禁用 var、严格相等、模板字符串等）
- 📁 **文件命名规范** - 5 项检查（Vue 组件、JS 文件、测试文件等）
- 🔤 **变量命名检查** - 6 项检查（常量、变量、类名、布尔值等）
- 📥 **导入规范检查** - 6 项检查（循环依赖、未使用导入、重复导入等）
- 📝 **注释规范检查** - 3 项检查（JSDoc、TODO/FIXME、大段注释代码）
- 🎭 **事件规范检查** - 9 项专项检查（Vue2 事件、JavaScript 事件）
- 🛡️ **空指针防护检查** - 9 项安全检查（属性访问、数组、API 响应）
- 🎯 **边界处理规范检查** - 11 项边界检查（循环、递归、除零、分页等）
- 🔥 **最佳实践检查** - 10 项检查（深拷贝、console、var、Promise链等）
- 📧 **消息提示一致性** - 7 项检查（统一消息提示用法）
- 🔒 **接口安全检查** - 8 项检查（错误处理、响应校验、超时设置等）
- ✅ **表单验证检查** - 9 项检查（验证规则、必填项、提交检查等）
- 📦 **依赖检查** - 6 项检查（重复导入、未使用导入、路径优化等）

##### ⚡ **性能与安全检查**
- ⚡ **性能检查** - 图片/JS/CSS 文件大小预算
- 🔒 **安全检查** - XSS 风险、eval 使用、敏感信息泄露
- 💧 **内存泄漏检查** - 定时器、事件监听器、全局变量污染

##### 📊 **报告与工具**
- 📊 **HTML 报告** - 详细的修复方案 + 代码对比 + 优先级标签
- 🚀 **增量检查** - 只检查 Git 变更文件，提高效率
- 💾 **文件缓存** - MD5 哈希缓存，避免重复检查
- 🎯 **Git Hooks** - pre-commit 自动检查

## 🏗️ 架构说明

项目采用 pnpm 工作空间架构：
- **pnpm**：负责依赖管理与包链接

### 常用命令

```bash
# 安装所有依赖
pnpm install

# 构建所有包
pnpm build

# 运行所有测试
pnpm test

# 并行启动所有包的开发模式
pnpm dev

# 在所有包中运行命令
pnpm -r <command>

# 在特定包中运行命令
pnpm --filter <package-name> <command>
```

## 📝 文档规范

- 每个包都维护相应的文档
- 技术规范记录在 docs/specs/ 目录下
- 使用指南放在 docs/guides/ 目录下

## 🔄 发布流程

1. 更新版本号 (遵循 SemVer)
2. 运行测试确保质量
3. 构建生产版本
4. 发布到 npm
5. 更新文档

### 包发布命令

```bash
# 发布特定包
pnpm publish:<package-name>

# 发布 webpack-spec-plugin
pnpm publish:webpack-spec-plugin
```

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 👥 贡献

欢迎提交 Issue 和 Pull Request！