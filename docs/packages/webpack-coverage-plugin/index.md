# webpack-coverage-plugin

[[toc]]

## 简介

webpack-coverage-plugin 是一个用于在开发阶段收集代码覆盖率并生成增量自测报告的 Webpack 插件。

## 功能特性

- 动态插桩：在 DevServer 启动时对代码进行插桩
- 实时收集：收集运行时的代码覆盖率数据
- 增量报告：与 Git Diff 结合，生成增量自测报告
- 开发者友好：提供悬浮控制台和快捷键操作

## 安装

```bash
npm install @51jbs/webpack-coverage-plugin
```

## 使用方法

### 1. 在 webpack 配置中引入插件

```javascript
const { WebpackCoveragePlugin } = require('@51jbs/webpack-coverage-plugin');

module.exports = {
  // ... 其他配置
  plugins: [
    new WebpackCoveragePlugin({
      enabled: process.env.ENABLE_SELF_TEST === 'true',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [/node_modules/, /\.test\./, /\.spec\./]
    })
  ]
};
```

### 2. 启用插件

在开发时，设置环境变量启用插件：

```bash
ENABLE_SELF_TEST=true npm run dev
```

### 3. 收集覆盖率数据

在开发过程中完成自测后，通过以下方式之一上传覆盖率数据：

1. 使用快捷键 (默认 Ctrl+Shift+C)
2. 点击页面右下角的悬浮控制台按钮

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| enabled | boolean | `process.env.ENABLE_SELF_TEST === 'true'` | 是否启用插件 |
| include | RegExp \| string[] | `[]` | 需要插桩的文件模式 |
| exclude | RegExp \| string[] | `[/node_modules/, /\.test\./, /\.spec\./]` | 需要排除的文件模式 |
| outputDir | string | `'.coverage'` | 输出目录 |

## 更新日志

详细的更新日志请查看 [CHANGELOG](./changelog.html)
