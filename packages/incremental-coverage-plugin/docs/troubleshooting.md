# 故障排查指南

本文档帮助您诊断和解决使用 Incremental Coverage Plugin 时遇到的常见问题。

---

## 🔍 问题诊断流程

遇到问题时，请按以下顺序检查：

1. ✅ 查看控制台输出，确认插件是否正常初始化
2. ✅ 检查 `.coverage/` 目录是否存在
3. ✅ 验证 Git diff 是否有变更
4. ✅ 确认 Babel 插桩是否生效

---

## 问题 1：覆盖率始终为 0 ❌

### 症状

- 插件正常启动
- 控制台显示 `增量覆盖率: 0.00%`
- HTML 报告显示 `0 changed lines`
- `.coverage/latest.html` 文件为空或无数据

### 可能原因和解决方案

#### 原因 1.1：Babel 插桩未生效

**诊断方法**：

打开浏览器开发者工具 → Sources 面板，查看源代码。**如果看不到 `__coverage__` 变量**，说明插桩未生效。

**解决方案**：

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          // ✅ 1. 禁用缓存（仅用于调试）
          cacheDirectory: false,
          
          // ✅ 2. 确保使用项目的 babel.config.js
          // 不要在这里内联配置
        }
      }
    ]
  }
};
```

检查 `babel.config.js`：

```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false }]
  ]
  // ✅ 不要添加 plugins，插件会自动注入
};
```

**重启开发服务器**并清除浏览器缓存。

#### 原因 1.2：include 配置不匹配

**诊断方法**：

```bash
# 查看项目的实际文件结构
ls -R src/

# 对比插件配置
```

**解决方案**：

确保 `include` 模式与实际文件路径匹配：

```javascript
WebpackIncrementalCoveragePlugin({
  // ❌ 错误：路径不匹配
  include: ['app/**/*.js'],
  
  // ✅ 正确：与实际目录结构匹配
  include: ['src/**/*.{js,vue}']
})
```

**常见匹配问题**：

| 实际路径 | 错误配置 | 正确配置 |
|---------|---------|---------|
| `src/views/Home.vue` | `views/**` | `src/views/**` |
| `src/components/Button.js` | `**/*.ts` | `**/*.{js,ts}` |
| `app/index.js` | `src/**` | `app/**` |

#### 原因 1.3：Git diff 没有检测到变更

**诊断方法**：

```bash
# 查看当前分支相对于 main 的变更
git diff main --name-only

# 应该看到修改的文件列表
```

如果输出为空，说明没有变更。

**解决方案 A**：确保有未提交的修改

```bash
# 修改一些文件
# 然后查看状态
git status
```

**解决方案 B**：修改 gitDiffBase

```javascript
WebpackIncrementalCoveragePlugin({
  // 如果你的主分支是 master
  gitDiffBase: 'master',
  
  // 或者对比特定 commit
  gitDiffBase: 'abc123',
  
  // 或者只对比最近一次提交
  gitDiffBase: 'HEAD~1'
})
```

#### 原因 1.4：未执行任何代码

**诊断方法**：

检查是否真的操作了修改的功能。

**解决方案**：

1. 在浏览器中**实际点击、输入、交互**
2. 确保执行了修改的代码路径
3. 等待 `reportInterval` 时间后查看报告

---

## 问题 2：报错 "Cannot find module '@babel/core'" ❌

### 症状

```
Error: Cannot find module '@babel/core'
Require stack:
- /path/to/node_modules/babel-plugin-istanbul/...
```

### 原因

从 v2.0.0 开始，`@babel/core` 已包含在插件依赖中。但可能是以下原因：

1. 使用了旧版本的插件
2. npm install 时出错
3. node_modules 损坏

### 解决方案

```bash
# 1. 检查插件版本
npm ls @51jbs/incremental-coverage-plugin

# 2. 如果版本 < 2.0.0，升级
npm install @51jbs/incremental-coverage-plugin@latest --save-dev

# 3. 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 4. 验证 @babel/core 已安装
npm ls @babel/core
```

---

## 问题 3：webpack-dev-server 中间件报错 ❌

### 症状

```
TypeError: Cannot read property 'unshift' of undefined
  at setupMiddlewares (webpack.config.js:...)
```

或

```
TypeError: middlewares.unshift is not a function
```

### 原因

webpack-dev-server 版本不兼容，需要 v4.0.0+

### 解决方案

```bash
# 1. 检查当前版本
npm ls webpack-dev-server

# 2. 升级到 v4+
npm install webpack-dev-server@^4.15.0 --save-dev

# 3. 确保 webpack 配置正确
```

更新 `webpack.config.js`：

```javascript
module.exports = {
  devServer: {
    // ✅ 使用 setupMiddlewares（webpack-dev-server 4.x）
    setupMiddlewares: (middlewares, devServer) => {
      // 插件会自动注入
      return middlewares;
    },
    
    // ❌ 不要使用旧的 before/after 配置
    // before: (app) => { ... }  // 已废弃
  }
};
```

---

## 问题 4：Git 检测失败 ❌

### 症状

```
[IncrementalCoverage] ⚠️ 未检测到 Git 变更
[IncrementalCoverage] 请检查：
  1. 当前目录是否是 Git 仓库
  2. gitDiffBase 是否正确
  3. 是否有未提交的修改
```

### 原因 4.1：不是 Git 仓库

**诊断**：

```bash
git status
# 如果报错：fatal: not a git repository
```

**解决方案**：

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit"

# 创建主分支
git branch -M main
```

### 原因 4.2：gitDiffBase 分支不存在

**诊断**：

```bash
# 查看所有分支
git branch -a

# 检查 main 分支是否存在
git rev-parse main
```

**解决方案**：

```javascript
WebpackIncrementalCoveragePlugin({
  // 使用存在的分支
  gitDiffBase: 'master',  // 或 'develop', 'HEAD'
})
```

### 原因 4.3：工作目录在子目录中

**症状**：项目在 Git 仓库的子目录中

**解决方案**：

插件会自动向上查找 Git 根目录，但您可以手动指定：

```javascript
WebpackIncrementalCoveragePlugin({
  // 指定 Git 根目录
  gitRoot: path.resolve(__dirname, '../..'),
  gitDiffBase: 'main'
})
```

---

## 问题 5：报告没有生成 ❌

### 症状

- `.coverage/` 目录不存在
- 或者目录存在但没有 `latest.html`

### 原因 5.1：reportInterval 太长

**解决方案**：

```javascript
WebpackIncrementalCoveragePlugin({
  reportInterval: 5000,  // 改为 5 秒，方便测试
})
```

等待足够时间后再检查。

### 原因 5.2：outputDir 路径不正确

**诊断**：

```bash
# 查看当前工作目录
pwd

# 查看是否有权限创建目录
mkdir .coverage
```

**解决方案**：

```javascript
WebpackIncrementalCoveragePlugin({
  // 使用绝对路径
  outputDir: path.resolve(__dirname, '.coverage'),
})
```

### 原因 5.3：权限问题

**解决方案**：

```bash
# 检查目录权限
ls -la .coverage/

# 如果有权限问题，删除并重新创建
rm -rf .coverage
npm run dev
```

---

## 问题 6：构建速度变慢 ❌

### 症状

- webpack 编译时间明显变长
- 首次加载很慢

### 原因

Babel 插桩会增加编译开销

### 解决方案

#### 方案 1：启用 Babel 缓存

```javascript
{
  test: /\.js$/,
  loader: 'babel-loader',
  options: {
    cacheDirectory: true,  // ✅ 启用缓存
    cacheCompression: false  // 禁用压缩以提速
  }
}
```

#### 方案 2：限制覆盖率统计范围

```javascript
WebpackIncrementalCoveragePlugin({
  // 只统计核心业务代码
  include: [
    'src/views/**',
    'src/components/**'
  ],
  exclude: [
    '**/*.test.js',
    '**/*.spec.js',
    '**/vendor/**',
    '**/config/**'
  ]
})
```

#### 方案 3：仅在需要时启用

```javascript
const isDev = process.env.NODE_ENV === 'development';
const needCoverage = process.env.COVERAGE === 'true';

module.exports = {
  plugins: [
    ...(isDev && needCoverage ? [
      new WebpackIncrementalCoveragePlugin({ /* ... */ })
    ] : [])
  ]
};
```

使用时：

```bash
# 普通开发（不统计覆盖率）
npm run dev

# 需要覆盖率时
COVERAGE=true npm run dev
```

---

## 问题 7：生产环境也插桩了 ❌

### 症状

- 生产环境代码包含 `__coverage__`
- bundle.js 文件变大

### 原因

插件在生产环境也被启用了

### 解决方案

```javascript
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    // ✅ 仅在开发环境启用
    ...(!isProd ? [
      new WebpackIncrementalCoveragePlugin({ /* ... */ })
    ] : [])
  ]
};
```

或者：

```javascript
// webpack.dev.js（开发配置）
const { WebpackIncrementalCoveragePlugin } = require('@51jbs/incremental-coverage-plugin/webpack');

module.exports = {
  plugins: [
    new WebpackIncrementalCoveragePlugin({ /* ... */ })
  ]
};

// webpack.prod.js（生产配置）
module.exports = {
  plugins: [
    // 不包含覆盖率插件
  ]
};
```

---

## 问题 8：覆盖率数据不准确 ❌

### 症状

- 明明测试了某个功能，但显示未覆盖
- 某些文件显示 100% 覆盖，但实际没测试

### 原因 8.1：Source Map 不正确

**解决方案**：

```javascript
module.exports = {
  // ✅ 使用合适的 source map
  devtool: 'eval-source-map',  // 开发环境推荐
  
  // ❌ 避免使用
  // devtool: false,  // 会导致行号不准
  // devtool: 'cheap-source-map',  // 可能不够精确
};
```

### 原因 8.2：代码分割导致的问题

**解决方案**：

确保所有 chunk 都被加载和执行。

---

## 🔧 调试技巧

### 1. 启用详细日志

在插件配置中添加：

```javascript
WebpackIncrementalCoveragePlugin({
  verbose: true  // 启用详细日志（如果插件支持）
})
```

### 2. 检查插桩代码

在浏览器控制台执行：

```javascript
// 查看覆盖率数据
console.log(window.__coverage__)

// 应该看到类似输出
{
  "/path/to/src/App.vue": {
    path: "/path/to/src/App.vue",
    s: { /* 语句覆盖 */ },
    b: { /* 分支覆盖 */ },
    f: { /* 函数覆盖 */ }
  }
}
```

### 3. 手动触发报告生成

如果使用的是插件的 API：

```javascript
// 在浏览器控制台
fetch('/api/coverage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(window.__coverage__)
})
```

---

## 📞 获取帮助

如果以上方法都无法解决您的问题，请：

1. 查看 [GitHub Issues](https://github.com/chuanjing729-glitch/fe-workspace/issues)
2. 提供以下信息：
   - Node.js 版本 (`node -v`)
   - npm/pnpm 版本
   - Webpack 版本
   - 插件版本
   - 完整的错误信息
   - 最小可复现示例

---

## ✅ 验证清单

问题解决后，请验证：

- [ ] 控制台有正确的插件初始化日志
- [ ] Git diff 正确检测到变更
- [ ] `.coverage/` 目录生成
- [ ] `latest.html` 有数据
- [ ] 覆盖率百分比合理（不是 0% 也不是 100%）
