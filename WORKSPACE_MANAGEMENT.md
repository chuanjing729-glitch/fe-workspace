# 前端工程工作空间管理方案

## 目录结构

```
fe-efficiency/                    # 根工作空间
├── packages/                     # 所有前端工程项目存放目录
│   ├── fe-quality-tools/         # 开发质量工具包
│   ├── fe-performance-utils/     # 性能优化工具集
│   ├── fe-build-optimizer/       # 构建优化工具
│   └── fe-dev-dashboard/         # 开发效率仪表板
├── docs/                         # 统一文档管理目录
│   ├── guides/                   # 使用指南
│   ├── api/                      # API文档
│   └── specs/                    # 技术规范
├── scripts/                      # 脚本目录
├── package.json                  # 工作空间根配置
├── pnpm-workspace.yaml           # pnpm工作空间配置
└── README.md                     # 工作空间说明文档
```

## 管理规范

### 1. 包命名规范
- 所有包名应以 `@your-org/` 作用域开头（根据实际情况调整）
- 功能相关的包应该使用相同的前缀，如 `fe-quality-*`

### 2. 版本管理
- 使用语义化版本控制 (SemVer)
- 主版本号：不兼容的API更改
- 次版本号：向后兼容的功能性新增
- 修订号：向后兼容的问题修正

### 3. 依赖管理
- 共享的依赖项放在根 package.json 的 devDependencies 中
- 各包特定的依赖项放在各自 package.json 中
- 使用 `pnpm add` 添加依赖

### 4. 文档规范
- 每个包都应在 docs/ 目录下维护相应文档
- 关键决策应记录在 specs/ 目录下
- 用户指南应放在 guides/ 目录下

## 创建新项目的流程

1. 在 packages/ 目录下创建新的项目文件夹
2. 初始化项目配置 (package.json)
3. 配置构建工具 (vite.config.ts)
4. 设置代码规范 (eslint, prettier)
5. 编写基础组件或工具函数
6. 添加单元测试
7. 编写API文档
8. 在根文档中添加项目介绍

## 发布流程

1. 更新版本号 (遵循 SemVer)
2. 运行测试确保质量
3. 构建生产版本
4. 发布到 npm
5. 更新文档

## 常用命令

```bash
# 安装所有依赖
pnpm install

# 在所有包中运行命令
pnpm -r build

# 在特定包中运行命令
pnpm --filter package-name dev

# 添加依赖到根目录
pnpm add -wD eslint

# 添加依赖到特定包
pnpm --filter package-name add lodash
```