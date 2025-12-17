# 快速开始指南

本文档将指导您如何在这个工作空间中开始开发。

## 环境准备

确保您的开发环境满足以下要求：

- Node.js >= 18
- pnpm >= 8

## 安装依赖

在工作空间根目录运行以下命令安装所有依赖：

```bash
pnpm install
```

这将安装所有包的依赖，包括根工作空间和各个子包。

## 开发流程

### 启动开发服务器

要启动特定包的开发服务器，可以使用以下命令：

```bash
pnpm --filter @fe-efficiency/fe-quantity-report dev
```

或者在包目录下直接运行：

```bash
cd packages/fe-quantity-report
pnpm dev
```

### 构建所有包

要构建所有包，可以在根目录运行：

```bash
pnpm build
```

### 构建特定包

要构建特定包，可以使用：

```bash
pnpm --filter @fe-efficiency/fe-quantity-report build
```

## 创建新包

使用我们提供的脚本创建新包：

```bash
node scripts/create-package.js my-new-package
```

这将创建一个新的包，包含推荐的目录结构和配置文件。

## 文档编写

所有文档都应放在 `docs/` 目录下：

- 使用指南放在 `docs/guides/`
- API文档放在 `docs/api/`
- 技术规范放在 `docs/specs/`

## 代码规范

我们使用 ESLint 和 Prettier 来保证代码风格的一致性。在提交代码前，请确保通过了代码检查：

```bash
pnpm lint
```

## 测试

我们使用 Vitest 进行单元测试。运行测试的命令是：

```bash
pnpm test
```

或者针对特定包：

```bash
pnpm --filter @fe-efficiency/fe-quantity-report test
```