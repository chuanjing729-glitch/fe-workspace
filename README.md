# 前端工程效率提升工作空间

这是一个用于提升前端开发质量、效率和性能的统一工作空间，适用于50人团队的管理需求。

## 目录结构

```
fe-workspace/
├── packages/                     # 所有前端工程项目存放目录
│   ├── fe-quality-tools/         # 开发质量工具包
│   ├── fe-performance-utils/     # 性能优化工具集
│   ├── fe-build-optimizer/       # 构建优化工具
│   └── fe-dev-dashboard/         # 开发效率仪表板
├── docs/                         # 统一文档管理目录
├── scripts/                      # 脚本目录
├── package.json                  # 工作空间根配置
├── pnpm-workspace.yaml           # pnpm工作空间配置
└── README.md                     # 工作空间说明文档
```

## 快速开始

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

## 创建新项目

使用提供的脚本创建新的包：

```bash
node scripts/create-package.js my-new-package
```

这将自动创建一个符合工作空间规范的新包。

## 包发布管理

```bash
pnpm publish:webpack-spec-plugin
```

## 工作空间管理

详细的工作空间管理方案请参考 [WORKSPACE_MANAGEMENT.md](./WORKSPACE_MANAGEMENT.md) 文件。

## 贡献

请阅读我们的贡献指南了解如何参与项目开发。