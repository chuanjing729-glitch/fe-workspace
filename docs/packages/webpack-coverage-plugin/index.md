# webpack-coverage-plugin

Webpack 插件用于在开发阶段收集代码覆盖率，并生成增量自测报告。

## 功能特性

- 动态插桩：在 DevServer 启动时对代码进行插桩
- 实时收集：收集运行时的代码覆盖率数据
- 增量报告：与 Git Diff 结合，生成增量自测报告
- 开发者友好：提供悬浮控制台和快捷键操作
- 影响范围分析：分析代码变更的影响范围，识别受影响的页面和组件
- 运行时小气泡：在页面中显示实时覆盖率进度的悬浮气泡
- 图表化报告：生成包含饼图、柱状图等可视化元素的HTML报告

## 兼容性

- Webpack 4.x 和 5.x
- Vue 2.x 项目
- 支持 CommonJS 和 ES Module
- TypeScript 类型支持

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

### 4. 运行时小气泡

插件会在页面右下角显示一个悬浮气泡，实时显示当前的代码覆盖率进度：

- 点击气泡可以展开详细信息面板
- 气泡颜色根据覆盖率自动变化（红色<50%，黄色50-80%，绿色>80%）
- 支持拖拽移动气泡位置
- 支持最小化气泡
- 详细面板包含影响范围分析结果
- 可以通过enableOverlay选项禁用此功能

### 5. 影响范围分析

插件会自动分析代码变更的影响范围，帮助开发者识别可能受影响的页面和组件：

- 自动识别受影响的页面列表
- 自动识别受影响的组件列表
- 评估影响程度（高/中/低）
- 分析影响传播路径
- 提供回归测试建议
- 可以通过enableImpactAnalysis选项禁用此功能

### 6. 查看自测报告

插件会在每次构建完成后自动生成两种格式的自测报告：

1. Markdown 格式：`<outputDir>/reports/self-test-report.md`
2. HTML 格式：`<outputDir>/reports/self-test-report.html`

报告包含测试环境信息、测试摘要和详细测试结果，其中HTML报告还包含丰富的图表：

- 饼图：展示测试通过率分布
- 柱状图：展示各组件/页面的代码行数和测试覆盖率
- 进度条：直观显示整体测试进度
- 热力图：展示代码复杂度分布
- 表格：展示业务信息和影响范围分析结果

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| enabled | boolean | `process.env.ENABLE_SELF_TEST === 'true'` | 是否启用插件 |
| include | RegExp \| string[] | `[]` | 需要插桩的文件模式 |
| exclude | RegExp \| string[] | `[/node_modules/, /\.test\./, /\.spec\./]` | 需要排除的文件模式 |
| outputDir | string | `'.coverage'` | 输出目录 |
| enableImpactAnalysis | boolean | `true` | 是否启用影响范围分析 |
| enableOverlay | boolean | `true` | 是否启用运行时小气泡 |

## 开发指南

### 构建项目

```bash
npm run build
```

构建过程会生成两个版本的代码：
- CommonJS 版本位于 `dist/cjs/` 目录
- ES Module 版本位于 `dist/` 目录
- TypeScript 类型定义文件位于 `dist/index.d.ts`

### 运行测试

```bash
npm test
```

测试套件包含：
- 单元测试：验证插件核心功能
- 集成测试：验证与 Webpack 的集成
- 报告生成测试：验证报告生成功能

### 示例项目

查看 `examples/` 目录下的示例项目，了解如何在实际项目中使用插件。

## 许可证

MIT @chuanjing.li
