# webpack-coverage-plugin 集成测试示例

本示例展示了如何在实际项目中使用 webpack-coverage-plugin 插件，并自动生成 HTML 和 MD 格式的自测报告。

## 使用步骤

1. 安装插件：
   ```bash
   npm install @51jbs/webpack-coverage-plugin
   ```

2. 在 webpack 配置中引入插件：
   ```javascript
   const { WebpackCoveragePlugin } = require('@51jbs/webpack-coverage-plugin');
   
   module.exports = {
     // ... 其他配置
     plugins: [
       new WebpackCoveragePlugin({
         enabled: process.env.ENABLE_SELF_TEST === 'true',
         include: ['src/**/*.{js,ts,jsx,tsx}'],
         exclude: [/node_modules/, /\.test\./, /\.spec\./],
         outputDir: '.coverage'
       })
     ]
   };
   ```

3. 启用插件并运行构建：
   ```bash
   ENABLE_SELF_TEST=true npm run build
   ```

4. 查看生成的自测报告：
   - Markdown 格式：`.coverage/reports/self-test-report.md`
   - HTML 格式：`.coverage/reports/self-test-report.html`

## 报告内容

生成的自测报告包含以下信息：

1. 测试环境信息（Node.js 版本、操作系统等）
2. 测试摘要（总测试数、通过数、失败数、通过率）
3. 详细测试结果
4. 测试结论

## 报告示例

### Markdown 格式报告
```markdown
# webpack-coverage-plugin 自测报告

## 测试信息
- 测试时间: 2025/12/18 11:30:45
- Node.js 版本: v20.19.6
- 操作系统: darwin

## 测试摘要
- 总测试数: 5
- 通过: 5
- 失败: 0
- 通过率: 100.00%
```

### HTML 格式报告
HTML 格式报告具有更好的可视化效果，包含：
- 彩色编码的状态指示器
- 图表化的测试摘要
- 可折叠的详细测试结果
- 响应式设计，适合在浏览器中查看

## 自动化集成

您可以将报告生成集成到 CI/CD 流程中：

```yaml
# GitHub Actions 示例
- name: Run tests with coverage
  run: |
    ENABLE_SELF_TEST=true npm run build
    # 上传报告作为 artifacts
    # 分析报告结果
```

这样，每次构建时都会自动生成自测报告，帮助团队了解插件的健康状况。