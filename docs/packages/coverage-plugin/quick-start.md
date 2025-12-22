# 快速开始

## 📦 安装

```bash
npm install @51jbs/coverage-plugin --save-dev
```

## ⚙️ 基础配置

### webpack.config.js

```javascript
const { WebpackCoveragePlugin } = require('@51jbs/coverage-plugin');

module.exports = {
  // ... 其他配置
  plugins: [
    new WebpackCoveragePlugin({
      enabled: process.env.ENABLE_SELF_TEST === 'true',
      include: ['src/**/*.{js,ts,jsx,tsx,vue}'],
      exclude: [
        'node_modules/**',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '**/tests/**'
      ],
      outputDir: '.coverage',
      enableOverlay: true,
      enableImpactAnalysis: true
    })
  ]
};
```

## 🎯 使用场景

### 1. 开发环境 - 增量覆盖率收集

```javascript
// webpack.dev.js
new WebpackCoveragePlugin({
  enabled: process.env.ENABLE_SELF_TEST === 'true',
  include: ['src/**/*.{js,ts,vue}'],
  exclude: ['node_modules/**'],
  outputDir: '.coverage'
})
```

### 2. 生产构建 - 禁用插件

```javascript
// webpack.prod.js
// 不添加 WebpackCoveragePlugin
```

### 3. CI/CD 流程

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: |
    export ENABLE_SELF_TEST=true
    npm run test
    
- name: Upload coverage report
  uses: actions/upload-artifact@v2
  with:
    name: coverage-report
    path: .coverage/reports/
```

## 🔧 运行时使用

### 启用插件

在开发时，设置环境变量启用插件：

```bash
ENABLE_SELF_TEST=true npm run dev
```

### 收集覆盖率数据

在开发过程中完成自测后，通过以下方式之一上传覆盖率数据：

1. 使用快捷键 (默认 Ctrl+Shift+C)
2. 点击页面右下角的悬浮控制台按钮

### 查看报告

插件会在每次构建完成后自动生成报告：

```bash
# Markdown 格式报告
cat .coverage/reports/self-test-report.md

# HTML 格式报告
open .coverage/reports/self-test-report.html
```

## 📊 报告查看

### HTML 报告

```bash
open .coverage/reports/self-test-report.html
```

报告包含：
- ✅ 测试环境信息
- ✅ 测试摘要（覆盖率、行数等）
- ✅ 详细测试结果
- ✅ 图表化展示（饼图、柱状图等）

### Markdown 报告

```bash
cat .coverage/reports/self-test-report.md
```

## 💡 常见问题

### Q: 如何在不同环境中控制插件启用？

```javascript
const isSelfTestEnabled = process.env.ENABLE_SELF_TEST === 'true';

module.exports = {
  plugins: [
    isSelfTestEnabled && new WebpackCoveragePlugin({
      // 配置选项
    })
  ].filter(Boolean)
};
```

### Q: 如何自定义覆盖率阈值？

```javascript
new WebpackCoveragePlugin({
  thresholds: {
    statements: 80,
    branches: 70,
    functions: 85,
    lines: 80
  }
})
```

### Q: 如何排除特定文件？

```javascript
new WebpackCoveragePlugin({
  exclude: [
    'node_modules/**',
    '**/*.test.js',
    '**/*.spec.js',
    'src/utils/legacy/**'
  ]
})
```

### Q: 如何禁用运行时小气泡？

```javascript
new WebpackCoveragePlugin({
  enableOverlay: false
})
```

## 📚 更多文档

- [功能特性](./features.md) - 所有功能详解
- [配置选项](./index.md#配置选项) - 配置详细说明
- [更新日志](./changelog.md) - 版本更新记录
- [真实项目验证](./validation-report.md) - 验证报告