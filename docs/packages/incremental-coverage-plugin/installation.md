# 安装指南

## 前置要求

在安装本插件之前，请确保：

- ✅ **Node.js** >= 16.0.0
- ✅ **项目已初始化 Git 仓库** (`git init`)
- ✅ **使用 Webpack 5+ 或 Vite 3+**
- ✅ **已安装 Babel**（对于 Webpack 项目）

### 检查前置要求

```bash
# 检查 Node.js 版本
node -v  # 应该 >= v16.0.0

# 检查是否是 Git 仓库
git status  # 应该不报错

# 检查 Webpack 版本
npm ls webpack
```

---

## 安装步骤

### 1. 安装插件

```bash
npm install @51jbs/incremental-coverage-plugin --save-dev
```

或使用 pnpm：

```bash
pnpm add @51jbs/incremental-coverage-plugin -D
```

### 2. 安装必要的 Babel 依赖（如果尚未安装）

> ⚠️ **注意**：插件已经内置了 `@babel/core` 等依赖。但如果您的项目还没有配置 Babel，需要额外安装：

```bash
npm install @babel/preset-env babel-loader --save-dev
```

### 3. 配置 Babel

创建或更新 `babel.config.js`：

```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,  // 保持 ES6 模块
      targets: { browsers: ['> 1%', 'last 2 versions'] }
    }]
  ]
  // 注意：不需要手动配置 babel-plugin-istanbul
  // 插件会在开发模式下自动注入
};
```

### 4. 验证安装

运行以下命令确认依赖安装成功：

```bash
# 检查插件
npm ls @51jbs/incremental-coverage-plugin

# 检查 Babel（应该看到版本号）
npm ls @babel/core
```

---

## 故障排查

### 问题 1：找不到 @babel/core

**错误信息**：
```
Error: Cannot find module '@babel/core'
```

**原因**：插件依赖 Babel 进行代码插桩

**解决方案**：
```bash
npm install @babel/core --save-dev
```

### 问题 2：peerDependency 警告

**警告信息**：
```
npm WARN MISSING PEER DEPENDENCY webpack@^5.0.0
```

**原因**：这是正常的，因为 webpack 和 vite 都是可选的 peer dependency

**解决方案**：
- 如果使用 Webpack：无需处理，只要项目中已安装 webpack
- 如果使用 Vite：无需处理，只要项目中已安装 vite

### 问题 3：安装后 node_modules 很大

**原因**：Istanbul 相关库会安装一些依赖

**优化方案**：
```bash
# 使用 pnpm 可以节省磁盘空间
pnpm install
```

---

## 下一步

安装完成后，请查看 [快速开始指南](./quick-start.md) 了解如何配置和使用插件。

## 卸载

如果需要卸载插件：

```bash
npm uninstall @51jbs/incremental-coverage-plugin
```

同时记得从 webpack 配置中移除插件配置。
