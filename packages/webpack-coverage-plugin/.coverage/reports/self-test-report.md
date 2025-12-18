# webpack-coverage-plugin 自测报告

## 测试信息
- 测试时间: 2025/12/18 15:16:02
- Node.js 版本: v20.19.6
- 操作系统: darwin
## 开发者信息

- **Git 用户名**: 张三
- **当前提交哈希**: a1b2c3d4e5f67890
- **当前分支名称**: feature/new-feature
- **硬件信息**: macOS 14.7.7, 8核CPU, 16GB内存


## 质量门禁 (Quality Gate)
- 增量行覆盖率: 85% (🟢 Pass)
  - 门禁阈值: 80%
- 增量分支覆盖率: 70% (🔴 Fail)
  - 门禁阈值: 80%
- 受影响接口数: 2 个 (来自 YApi 插件的数据预留位)
  - 门禁阈值: 10 个
## 代码信息
- 提交代码量: 150 行
- 代码复杂度: 2.5 (代码复杂度基于圈复杂度算法计算，数值越高表示代码越复杂，维护成本越高。)
- 重要代码重要程度: 中 (重要代码重要程度根据代码位置、调用频率、业务关键性等因素综合评估。)
## 业务信息

| 页面名称 | 组件名称 | 代码行数 | 自测总数 | 自测通过数 | 严重等级 |
|---------|---------|---------|---------|----------|---------|
| HomePage | Button | 45 | 10 | 9 | medium |
| UserProfile | Form | 78 | 15 | 15 | low |
## 影响范围分析

### 受影响的页面
- src/pages/HomePage.jsx

### 受影响的组件
- src/components/Button.jsx

### 影响程度
🟢 低

### 影响传播路径
1. src/components/Button.jsx
2. src/pages/HomePage.jsx
3. src/utils/helper.js

### 回归测试建议
- 优先测试以下页面: src/pages/HomePage.jsx
- 检查以下组件的集成: src/components/Button.jsx
- 建议进行局部回归测试

### 可执行的回归测试命令
```
npx jest src/pages/HomePage.jsx src/components/Button.jsx
```
## 插件测试结果

- ✅ 插件实例化测试 (2ms)
- ✅ 配置选项测试 (1ms)
- ✅ Webpack 钩子注册测试 (3ms)
- ✅ DevServer 集成测试 (5ms)
- ✅ 覆盖率数据收集测试 (4ms)

## 业务测试结果

业务测试通过率: 96.00%


| 页面名称 | 组件名称 | 代码行数 | 自测总数 | 自测通过数 | 自测失败数 | 严重等级 | API 关联状态 |
|---------|---------|---------|---------|----------|----------|---------|------------|
| HomePage | Button | 45 | 10 | 9 | 1 | medium | - |
| UserProfile | Form | 78 | 15 | 15 | 0 | low | - |

## 结论
⚠️ 部分质量门禁未通过，请检查相关问题。
