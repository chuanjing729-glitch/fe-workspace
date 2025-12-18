# 运行时小气泡演示

这是一个演示项目，用于展示 webpack-coverage-plugin 的运行时小气泡功能。

## 功能演示

1. 运行时小气泡：在页面右下角显示覆盖率进度的悬浮气泡
2. 影响范围分析：分析代码变更的影响范围
3. 图表化报告：生成包含图表的HTML报告

## 使用方法

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

然后访问 http://localhost:9000

### 构建项目

```bash
npm run build
```

## 配置说明

插件配置在 `webpack.config.js` 中：

```javascript
new WebpackCoveragePlugin({
  enabled: process.env.ENABLE_SELF_TEST === 'true',
  include: ['src/**/*.{js,ts,jsx,tsx}'],
  exclude: [/node_modules/, /\.test\./, /\.spec\./],
  enableOverlay: true, // 启用运行时小气泡
  enableImpactAnalysis: true // 启用影响范围分析
})
```

## 功能说明

### 运行时小气泡

启用插件后，页面右下角会显示一个绿色的小气泡：

- 点击气泡可以展开详细信息面板
- 气泡颜色根据覆盖率自动变化
- 支持拖拽移动气泡位置
- 支持最小化气泡

### 影响范围分析

插件会自动分析代码变更的影响范围：

- 自动识别受影响的页面列表
- 自动识别受影响的组件列表
- 评估影响程度（高/中/低）
- 分析影响传播路径
- 提供回归测试建议

### 图表化报告

每次构建完成后会生成两种格式的报告：

1. Markdown 格式：`.coverage/reports/self-test-report.md`
2. HTML 格式：`.coverage/reports/self-test-report.html`

HTML报告包含丰富的图表：
- 饼图：展示测试通过率分布
- 柱状图：展示各组件/页面的代码行数和测试覆盖率
- 进度条：直观显示整体测试进度
- 热力图：展示代码复杂度分布