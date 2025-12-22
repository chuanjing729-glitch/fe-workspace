# Webpack 4 + Vue 2 Example

这是 Incremental Coverage Plugin 的 **Webpack 4** 示例项目。

## 特性

- ✅ **Webpack 4.46.0**
- ✅ **webpack-dev-server 3.11.3**
- ✅ **Vue 2.7.16**
- ✅ **自动检测并使用 `before` API**
- ✅ **完整的覆盖率统计**

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器会自动打开 `http://localhost:8080`

### 3. 验证插件工作

启动成功后，检查控制台输出：

```
[IncrementalCoverage] 插件已初始化
[IncrementalCoverage] Webpack 模式
[IncrementalCoverage] 已注入到 babel-loader
[IncrementalCoverage] 中间件已注册 (webpack-dev-server 3.x)  ← 重要
```

✅ 如果看到 `webpack-dev-server 3.x`，说明插件正确检测到了 webpack 4 环境。

### 4. 测试功能

1. 在浏览器中操作功能（点击按钮、添加任务）
2. 等待 5 秒
3. 查看 `.coverage/latest.html` 报告
4. 右下角会显示覆盖率浮窗

## 功能测试清单

- [ ] 点击"增加"按钮 → 触发 `increment()` 方法
- [ ] 点击"减少"按钮 → 触发 `decrement()` 方法
- [ ] 点击"重置"按钮 → 触发 `reset()` 方法
- [ ] 添加新任务 → 触发 `addTask()` 方法
- [ ] 点击任务完成 → 触发 `toggleTask()` 方法
- [ ] 删除任务 → 触发 `removeTask()` 方法
- [ ] 查看覆盖率报告 → 打开 `.coverage/latest.html`

## 预期输出

### 控制台日志

```
[IncrementalCoverage] 插件已初始化
[IncrementalCoverage] Webpack 模式
[IncrementalCoverage] 已注入到 babel-loader
[IncrementalCoverage] 中间件已注册 (webpack-dev-server 3.x)
[Coverage Client] 启动 v2.2 with Overlay
[IncrementalCoverage] 📊 收到覆盖率数据，文件数: 2
[IncrementalCoverage] 增量覆盖率: 75.00% (覆盖 15/20 行)
```

### 覆盖率浮窗

右下角会显示一个悬浮窗，实时显示：
- 增量覆盖率百分比
- 变更的行数
- 颜色指示（绿色≥80%，橙色≥50%，红色<50%）

### 生成的报告

```
.coverage/
├── baseline.json
├── latest.html               ← 最新报告
├── coverage-report-*.html    ← 历史报告
└── coverage-report-*.json    ← JSON 数据
```

## 与 Webpack 5 的区别

| 特性 | Webpack 4 (本示例) | Webpack 5 |
|------|-------------------|-----------|
| devServer.contentBase | ✅ 使用 | ❌ 已弃用，使用 static |
| webpack-dev-server | 3.11.3 | 4.15.0+ |
| 中间件 API | `before` | `setupMiddlewares` |
| 插件行为 | 自动使用 before | 自动使用 setupMiddlewares |

## 故障排查

### 问题：中间件注册失败

**症状**：
```
TypeError: Cannot read property 'post' of undefined
```

**原因**：webpack-dev-server 版本不匹配

**解决**：
```bash
# 确认使用 webpack-dev-server 3.x
npm ls webpack-dev-server
```

### 问题：覆盖率为 0

**检查**：
1. 确认 Git 有变更：`git status`
2. 确认插桩成功：浏览器控制台查看 `window.__coverage__`
3. 确认路径配置：`include: ['src/**']`

## 配置说明

插件配置位于 `webpack.config.js`：

```javascript
new WebpackIncrementalCoveragePlugin({
  include: ['src/**/*.{js,vue}'],  // 统计范围
  gitDiffBase: 'main',              // Git 基准分支
  threshold: 50,                    // 阈值（50%）
  reportInterval: 5000,             // 5秒生成报告
  enableOverlay: true               // 启用浮窗
})
```

## 构建生产版本

```bash
npm run build
```

注意：生产环境**不应该**包含覆盖率插件，请在 webpack.config.js 中添加环境判断。

## 参考文档

- [安装指南](../../docs/installation.md)
- [快速开始](../../docs/quick-start.md)
- [故障排查](../../docs/troubleshooting.md)
- [API 文档](../../docs/api.md)
