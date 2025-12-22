# 功能特性

## 📊 核心功能概览

coverage-plugin 提供完整的代码覆盖率收集和自测报告生成功能。

| 功能模块 | 子功能 | 说明 |
|---------|-------|------|
| 动态插桩 | 运行时插桩 | DevServer 启动时自动插桩 |
| 覆盖率收集 | 实时收集 | 收集运行时的代码覆盖率数据 |
| 增量报告 | Git Diff | 与 Git Diff 结合生成增量自测报告 |
| 开发者工具 | 悬浮控制台 | 提供悬浮控制台和快捷键操作 |
| 影响分析 | 范围分析 | 分析代码变更的影响范围 |
| 运行时提示 | 小气泡 | 显示实时覆盖率进度的悬浮气泡 |
| 报告生成 | 图表化 | 生成包含图表的 HTML 报告 |

## 1. 动态插桩

### 插桩时机

在 DevServer 启动时对匹配的文件进行插桩：

```javascript
// 插桩前
function add(a, b) {
  return a + b;
}

// 插桩后
function add(a, b) {
  __coverage__['src/utils/math.js'].s[0]++;
  return a + b;
}
```

### 插桩配置

```javascript
new WebpackCoveragePlugin({
  include: ['src/**/*.{js,ts,vue}'],
  exclude: [
    'node_modules/**',
    '**/*.test.js',
    '**/*.spec.js'
  ]
})
```

## 2. 覆盖率收集

### 收集机制

- ✅ 运行时收集执行信息
- ✅ 自动上报覆盖率数据
- ✅ 支持手动触发收集

### 数据结构

```json
{
  "path": "src/components/Button.vue",
  "statementMap": {
    "0": { "start": { "line": 10, "column": 4 }, "end": { "line": 10, "column": 20 } }
  },
  "fnMap": {
    "0": { "name": "onClick", "decl": { "start": { "line": 15, "column": 2 }, "end": { "line": 15, "column": 15 } } }
  },
  "branchMap": {
    "0": { "type": "if", "locations": [/* ... */] }
  },
  "s": { "0": 1 }, // statement counts
  "f": { "0": 1 }, // function counts
  "b": { "0": [1, 0] } // branch counts
}
```

## 3. 增量报告

### Git Diff 集成

```bash
# 自动获取当前分支与主分支的差异
git diff origin/main..HEAD --name-only
```

### 报告内容

#### 1. 变更文件列表
- ✅ 新增文件
- ✅ 修改文件
- ✅ 删除文件

#### 2. 覆盖率统计
- ✅ 语句覆盖率
- ✅ 分支覆盖率
- ✅ 函数覆盖率
- ✅ 行覆盖率

#### 3. 未覆盖代码
- ✅ 具体行号
- ✅ 代码片段
- ✅ 修复建议

## 4. 开发者工具

### 悬浮控制台

提供便捷的操作界面：

```
┌─────────────────────────────┐
│ 📊 覆盖率: 85%             │
│                             │
│ [上传数据] [查看报告] [重置] │
└─────────────────────────────┘
```

### 快捷键支持

- `Ctrl+Shift+C`: 上传覆盖率数据
- `Ctrl+Shift+R`: 重置覆盖率数据
- `Ctrl+Shift+V`: 查看覆盖率报告

## 5. 影响范围分析

### 分析机制

自动分析代码变更的影响范围：

```javascript
// 当修改了 user-service.js
// 插件会分析以下受影响的文件：
// - src/views/UserList.vue
// - src/views/UserDetail.vue
// - src/components/UserCard.vue
```

### 影响等级

- 🔴 高: 直接依赖，必须测试
- 🟡 中: 间接依赖，建议测试
- 🟢 低: 可能依赖，可选测试

## 6. 运行时小气泡

### 气泡功能

在页面右下角显示实时覆盖率进度：

```
┌─────┐
│ 85% │
└─────┘
```

### 交互特性

- ✅ 点击展开详细信息面板
- ✅ 拖拽移动气泡位置
- ✅ 最小化/最大化切换
- ✅ 颜色根据覆盖率自动变化

### 颜色规则

- 🔴 红色: < 50%
- 🟡 黄色: 50% - 80%
- 🟢 绿色: > 80%

## 7. 报告生成

### HTML 报告

包含丰富的可视化元素：

#### 1. 概览面板
- ✅ 整体覆盖率统计
- ✅ 变更文件列表
- ✅ 影响范围分析

#### 2. 图表展示
- ✅ 饼图: 覆盖率分布
- ✅ 柱状图: 各组件覆盖率
- ✅ 进度条: 整体进度
- ✅ 热力图: 代码复杂度

#### 3. 详细数据
- ✅ 未覆盖代码行
- ✅ 代码片段展示
- ✅ 修复建议

### Markdown 报告

简洁的文本格式报告：

```markdown
# 自测报告

## 概览
- 覆盖率: 85%
- 测试文件数: 12
- 总行数: 1250

## 未覆盖代码
### src/components/Button.vue
- 第 25 行: 未执行分支
- 第 32 行: 未执行语句
```

## 🎨 报告示例

### HTML 报告截图

```html
<div class="coverage-report">
  <div class="header">
    <h1>自测覆盖率报告</h1>
    <div class="stats">
      <span class="coverage-rate">85%</span>
      <span class="files-count">12 files</span>
    </div>
  </div>
  
  <div class="charts">
    <div class="pie-chart">...</div>
    <div class="bar-chart">...</div>
  </div>
  
  <div class="details">
    <h2>未覆盖代码</h2>
    <div class="uncovered-item">
      <div class="file-path">src/components/Button.vue</div>
      <div class="lines">Lines 25, 32, 45</div>
    </div>
  </div>
</div>
```

## ⚡ 性能优化

### 插桩优化

- ✅ 只对变更文件插桩
- ✅ 缓存已插桩的文件
- ✅ 并行处理多个文件

### 数据收集

- ✅ 批量上报数据
- ✅ 本地缓存临时数据
- ✅ 异步处理不影响性能

## 🛡️ 安全特性

### 数据隔离

```javascript
// 覆盖率数据只在当前域名下存储
localStorage.setItem('coverage_data', data);

// 不会跨域传输敏感信息
```

### 权限控制

```javascript
// 只在开发环境启用
if (process.env.NODE_ENV === 'development') {
  // 启用覆盖率收集
}
```

## 📚 相关文档

- [快速开始](./quick-start.md) - 快速上手指南
- [配置选项](./index.md#配置选项) - 配置详细说明
- [更新日志](./changelog.md) - 版本更新记录
- [真实项目验证](./validation-report.md) - 验证报告