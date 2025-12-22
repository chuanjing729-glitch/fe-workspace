# 快速开始

## 📦 安装

```bash
npm install @51jbs/spec-plugin --save-dev
```

## ⚙️ 配置

### webpack.config.js

```javascript
const SpecPlugin = require('@51jbs/spec-plugin')

module.exports = {
  plugins: [
    new SpecPlugin({
      // 检查模式：'incremental' | 'full'
      mode: 'incremental',
      
      // 严格程度：'normal' | 'strict'
      severity: 'normal',
      
      // 启用的规则
      rules: {
        naming: true,           // 文件命名检查
        comments: true,         // 注释规范检查
        performance: true,      // 性能检查
        imports: true,          // 导入规范检查
        variableNaming: true,   // 变量命名检查
        memoryLeak: true,       // 内存泄漏检查
        security: true          // 安全检查
      },
      
      // 性能预算
      performanceBudget: {
        maxImageSize: 500,  // KB
        maxJsSize: 300,     // KB
        maxCssSize: 100,    // KB
        maxFontSize: 200    // KB
      },
      
      // HTML 报告
      htmlReport: true,
      reportPath: 'spec-report.html',
      
      // 排除文件
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.js'
      ]
    })
  ]
}
```

## 🎯 使用场景

### 1. 开发环境 - 增量检查

```javascript
// webpack.dev.js
new SpecPlugin({
  mode: 'incremental',  // 只检查 Git 变更文件
  severity: 'normal'     // 只有错误才中断
})
```

### 2. 生产构建 - 全量检查

```javascript
// webpack.prod.js
new SpecPlugin({
  mode: 'full',          // 检查所有文件
  severity: 'strict'     // 警告也中断构建
})
```

### 3. CI/CD 流程

```yaml
# .github/workflows/ci.yml
- name: Build with spec check
  run: npm run build
  
- name: Upload spec report
  uses: actions/upload-artifact@v2
  with:
    name: spec-report
    path: spec-report.html
```

## 🔧 Git Hooks 集成

### 安装 Git Hook

```bash
node scripts/install-git-hook.js
```

### 自动检查

- **pre-commit**: 提交前检查变更文件
- **commit-msg**: 检查提交信息格式

## 📊 查看报告

构建完成后，会生成 HTML 报告：

```bash
open spec-report.html
```

报告包含：
- ✅ 整体总结和问题分类
- ✅ 优先级标签 (P0/P1/P2)
- ✅ 详细修复方案
- ✅ 代码对比示例
- ✅ 统计图表

## 🚀 命令行工具

### 检查单个文件

```bash
npx spec-check src/App.vue
```

### 检查整个目录

```bash
npx spec-check src/
```

### 生成报告

```bash
npx spec-check --report
```

## 💡 常见问题

### Q: 如何关闭某个规则？

```javascript
rules: {
  naming: false,  // 关闭文件命名检查
}
```

### Q: 如何自定义性能预算？

```javascript
performanceBudget: {
  maxImageSize: 1000,  // 提高到 1MB
}
```

### Q: 如何排除特定文件？

```javascript
exclude: [
  'node_modules/**',
  'src/legacy/**',      // 排除旧代码
  '**/*.generated.js'   // 排除生成代码
]
```

## 📚 更多文档

- [功能特性](./features.md) - 完整功能列表
- [更新日志](./changelog.md) - 版本更新记录
- [真实项目验证](../reports/real-project-validation.md) - 验证报告
