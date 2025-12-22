# 快速开始

> 本指南将帮助你在 **15 分钟内**完成 Webpack 项目的接入。

---

## � 开始前检查

请确保已完成 [安装指南](./installation.md) 中的所有步骤。

---

## 完整配置示例

### 支持的 Webpack 版本

本插件支持以下 Webpack 和 webpack-dev-server 组合：

| Webpack | webpack-dev-server | 插件行为 |
|---------|-------------------|---------|
| 4.x | 3.x | ✅ 自动使用 `before` API |
| 4.x | 4.x | ✅ 自动使用 `setupMiddlewares` API |
| 5.x | 4.x | ✅ 自动使用 `setupMiddlewares` API |
| 5.x | 5.x | ✅ 自动使用 `setupMiddlewares` API |

> 💡 **无需手动配置**：插件会自动检测您的 webpack-dev-server 版本并使用对应的 API。

---

### Webpack 5 + Vue 2 配置

### 1. 项目结构

```
my-project/
├── src/
│   ├── main.js
│   ├── App.vue
│   └── components/
│       └── HelloWorld.vue
├── babel.config.js
├── webpack.config.js
└── package.json
```

### 2. package.json

确保已安装所有必要依赖：

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "scripts": {
    "dev": "webpack serve --mode development"
  },
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "babel-loader": "^9.1.0",
    "@51jbs/incremental-coverage-plugin": "^2.0.0",
    "vue": "^2.7.0",
    "vue-loader": "^15.10.0",
    "vue-template-compiler": "^2.7.0",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.0",
    "webpack-dev-server": "^4.15.0",
    "html-webpack-plugin": "^5.5.0"
  }
}
```

### 3. babel.config.js

```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      targets: { browsers: ['> 1%', 'last 2 versions'] }
    }]
  ]
  // ✅ 无需手动添加 babel-plugin-istanbul
  // 插件会自动注入
};
```

### 4. webpack.config.js

```javascript
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackIncrementalCoveragePlugin } = require('@51jbs/incremental-coverage-plugin/webpack');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  
  // ⚠️ 重要：必须配置 source map
  devtool: 'eval-source-map',
  
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        // ⚠️ 重要：确保 babel-loader 正确配置
        options: {
          cacheDirectory: true
        }
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      }
    ]
  },
  
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    
    // ✅ 增量覆盖率插件配置
    new WebpackIncrementalCoveragePlugin({
      // 需要统计覆盖率的文件（支持 glob 模式）
      include: ['src/**/*.{js,vue}'],
      
      // 排除的文件
      exclude: [
        '**/*.test.js',
        '**/*.spec.js',
        '**/node_modules/**'
      ],
      
      // Git 对比基准（可以是分支名或 commit hash）
      gitDiffBase: 'main',  // 或 'master', 'develop'
      
      // 增量覆盖率阈值（百分比）
      threshold: 80,
      
      // 报告输出目录
      outputDir: '.coverage',
      
      // 报告生成间隔（毫秒）
      reportInterval: 10000,  // 10秒
      
      // 保留的历史报告数量
      historyCount: 15
    })
  ],
  
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 9000,
    hot: true,
    open: true,
    
    // ⚠️ 重要：webpack 5 需要配置 setupMiddlewares
    // 插件会自动注入中间件来接收覆盖率数据
    setupMiddlewares: (middlewares, devServer) => {
      return middlewares;
    }
  }
};

---

### Webpack 4 + Vue 2 配置

如果您使用 Webpack 4，配置方式类似，但有以下差异：

#### package.json

```json
{
  "devDependencies": {
    "@babel/core": "^7.23.0",
    "@babel/preset-env": "^7.23.0",
    "babel-loader": "^8.3.0",
    "@51jbs/incremental-coverage-plugin": "^2.0.0",
    "html-webpack-plugin": "^4.5.2",
    "vue": "^2.7.0",
    "vue-loader": "^15.10.0",
    "vue-template-compiler": "^2.7.0",
    "webpack": "^4.46.0",
    "webpack-cli": "^3.3.12",
    "webpack-dev-server": "^3.11.3"
  }
}
```

#### webpack.config.js

```javascript
const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { WebpackIncrementalCoveragePlugin } = require('@51jbs/incremental-coverage-plugin/webpack');

module.exports = {
  mode: 'development',
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  
  devtool: 'eval-source-map',
  
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new WebpackIncrementalCoveragePlugin({
      include: ['src/**/*.{js,vue}'],
      gitDiffBase: 'main',
      threshold: 80
    })
  ],
  
  devServer: {
    contentBase: path.join(__dirname, 'dist'),  // webpack 4 使用 contentBase
    compress: true,
    port: 8080,
    hot: true,
    open: true
    // ✅ webpack 4 无需配置 setupMiddlewares 或 before
    // 插件会自动检测并使用正确的 API
  }
};
```

> 💡 **关键差异**：
> - webpack 4 使用 `contentBase`，webpack 5 使用 `static`
> - webpack 4 通常搭配 webpack-dev-server 3.x
> - **插件会自动适配**，无需手动配置中间件

### 5. 添加到 .gitignore

```bash
# 添加到 .gitignore
echo ".coverage/" >> .gitignore
echo "coverage/" >> .gitignore
```

---

## 🚀 启动开发服务器

```bash
npm run dev
```

**成功启动后，控制台应该显示：**

```
[IncrementalCoverage] 插件已初始化
[IncrementalCoverage] Git diff 检测到 3 个文件变更
  src/components/HelloWorld.vue
  src/App.vue
  src/main.js
```

---

## 📊 使用流程

### 步骤 1：确保有代码变更

```bash
# 查看当前变更
git diff main --name-only

# 或者创建一些修改
# 编辑 src/components/HelloWorld.vue
```

### 步骤 2：在浏览器中测试

1. 浏览器会自动打开 `http://localhost:9000`
2. **操作你修改的功能**（点击按钮、输入数据等）
3. 插件会自动收集覆盖率数据

### 步骤 3：查看覆盖率报告

等待 10 秒后（reportInterval），插件会生成报告：

```bash
# 查看最新报告
open .coverage/latest.html

# 或在浏览器直接打开
file://你的项目路径/.coverage/latest.html
```

**报告内容包括：**
- 📊 增量覆盖率百分比
- 📁 变更文件列表
- ✅ 已覆盖的行号（绿色）
- ❌ 未覆盖的行号（红色）

---

## ✅ 验证插件是否正常工作

### 1. 检查控制台输出

启动成功后应该看到：

```
✔ [IncrementalCoverage] 插件已初始化
✔ [IncrementalCoverage] Git diff 检测到 5 个文件变更
✔ [IncrementalCoverage] 成功注入 babel-plugin-istanbul
```

操作功能后应该看到：

```
✔ [IncrementalCoverage] 📊 收到覆盖率数据，文件数: 3
✔ [IncrementalCoverage] 增量覆盖率: 75.00% (覆盖 15/20 行)
✔ [IncrementalCoverage] ✅ 增量覆盖率达标（阈值: 80%）
```

### 2. 检查生成的文件

```bash
ls -la .coverage/

# 应该看到
drwxr-xr-x  .coverage/
-rw-r--r--  baseline.json
-rw-r--r--  latest.html
-rw-r--r--  coverage-report-20231222-135900.html
-rw-r--r--  coverage-report-20231222-135900.json
```

### 3. 检查 Babel 插桩

打开浏览器开发者工具 → Sources 面板，查看源代码，应该能看到类似的插桩代码：

```javascript
var __coverage__ = {
  "/path/to/src/App.vue": {
    // 覆盖率数据
  }
};
```

---

## � 常见问题

### 问题 1：覆盖率始终为 0

**可能原因**：
1. Babel 插桩未生效
2. include 配置不匹配
3. 未执行任何代码

**解决方案**：参考 [故障排查文档](./troubleshooting.md)

### 问题 2：未检测到 Git 变更

**错误信息**：
```
[IncrementalCoverage] ⚠️ 未检测到 Git 变更
```

**解决方案**：
```bash
# 1. 确认是 Git 仓库
git status

# 2. 确认有未提交的修改
git diff main

# 3. 或者修改基准分支
gitDiffBase: 'develop'
```

### 问题 3：报告没有生成

**可能原因**：
- reportInterval 设置太长
- outputDir 路径不正确

**解决方案**：
```javascript
{
  reportInterval: 5000,  // 改为 5 秒
  outputDir: '.coverage'  // 确认路径正确
}
```

---

## 📁 产物说明

运行后，`.coverage/` 目录结构如下：

```text
.coverage/
├── baseline.json              # 基准覆盖率数据
├── latest.html                # 最新的增量报告视图
├── coverage-report-TIMESTAMP.html  # 带时间戳的历史报告
└── coverage-report-TIMESTAMP.json  # 结构化数据（便于 CI 集成）
```

---

## 🎯 下一步

- [查看功能特性](./features.md) 了解更多高级用法
- [技术架构](./architecture.md) 了解插件工作原理
- [API 参考](./api.md) 查看完整配置项
- [故障排查](./troubleshooting.md) 解决常见问题
