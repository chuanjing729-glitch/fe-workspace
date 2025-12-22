# Webpack Spec Plugin 配置示例

## 基础配置示例

```javascript
// webpack.config.js
const SpecPlugin = require('@51jbs/spec-plugin')

module.exports = {
  // ... 其他配置
  plugins: [
    new SpecPlugin()
  ]
}
```

## 开发环境配置

```javascript
// webpack.dev.js
const SpecPlugin = require('@51jbs/spec-plugin')

module.exports = {
  mode: 'development',
  plugins: [
    new SpecPlugin({
      mode: 'incremental',        // 增量检查，速度快
      severity: 'normal',          // 只有错误中断构建
      rules: {
        naming: true,
        comments: false,           // 开发时可关闭注释检查
        performance: true,
        imports: true,
        assets: true
      },
      performanceBudget: {
        maxImageSize: 500,
        maxJsSize: 300,
        maxCssSize: 100,
        maxFontSize: 200
      },
      htmlReport: false,           // 开发时不生成HTML报告
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.test.ts'             // 排除测试文件
      ]
    })
  ]
}
```

## 生产环境配置

```javascript
// webpack.prod.js
const SpecPlugin = require('@51jbs/spec-plugin')

module.exports = {
  mode: 'production',
  plugins: [
    new SpecPlugin({
      mode: 'full',                // 全量检查，确保所有文件符合规范
      severity: 'strict',          // 严格模式，警告也会中断构建
      rules: {
        naming: true,
        comments: true,            // 生产环境检查注释
        performance: true,
        imports: true,
        assets: true
      },
      performanceBudget: {
        maxImageSize: 500,
        maxJsSize: 300,
        maxCssSize: 100,
        maxFontSize: 200
      },
      htmlReport: true,            // 生成HTML报告
      reportPath: 'spec-report.html'
    })
  ]
}
```

## CI/CD 配置

```javascript
// webpack.ci.js
const SpecPlugin = require('@51jbs/spec-plugin')

module.exports = {
  mode: 'production',
  plugins: [
    new SpecPlugin({
      mode: 'full',
      severity: 'strict',
      rules: {
        naming: true,
        comments: true,
        performance: true,
        imports: true,
        assets: true
      },
      performanceBudget: {
        maxImageSize: 400,         // CI 环境更严格
        maxJsSize: 250,
        maxCssSize: 80,
        maxFontSize: 150
      },
      htmlReport: true,
      reportPath: 'reports/spec-report.html',
      exclude: [
        '**/node_modules/**',
        '**/test/**',
        '**/__mocks__/**'
      ]
    })
  ]
}
```

## 自定义规则配置

```javascript
const SpecPlugin = require('@51jbs/spec-plugin')

module.exports = {
  plugins: [
    new SpecPlugin({
      // 只检查命名和性能
      rules: {
        naming: true,
        comments: false,
        performance: true,
        imports: false,
        assets: false
      },
      
      // 针对移动端项目调整性能预算
      performanceBudget: {
        maxImageSize: 300,   // 移动端图片更小
        maxJsSize: 200,
        maxCssSize: 50,
        maxFontSize: 100
      }
    })
  ]
}
```

## Package.json 脚本配置

```json
{
  "scripts": {
    "dev": "webpack --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js",
    "build:ci": "webpack --config webpack.ci.js",
    "spec:check": "webpack --config webpack.spec.js"
  }
}
```

## 与其他插件配合使用

```javascript
const SpecPlugin = require('@51jbs/spec-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  plugins: [
    // SpecPlugin 建议放在最前面，优先检查规范
    new SpecPlugin({
      mode: 'incremental',
      severity: 'normal'
    }),
    
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
    
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ]
}
```
