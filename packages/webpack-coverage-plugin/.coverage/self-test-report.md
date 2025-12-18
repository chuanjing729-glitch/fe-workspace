# webpack-coverage-plugin 自测报告

## 测试信息
- 测试时间: 2025/12/18 12:42:10
- Node.js 版本: v20.19.6
- 操作系统: darwin

## 开发者信息
- Git 用户名: 张三
- 当前提交哈希: a1b2c3d4e5f67890
- 当前分支名称: feature/new-feature
- 硬件信息: macOS 14.7.7, 8核CPU, 16GB内存

## 测试摘要
- 总测试数: 5
- 通过: 5
- 失败: 0
- 通过率: 100.00%
## 代码信息
- 提交代码量: 150 行
- 代码复杂度: 2.5
- 重要代码重要程度: 中
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

## 详细测试结果

- ✅ 插件实例化测试 (2ms)
- ✅ 配置选项测试 (1ms)
- ✅ Webpack 钩子注册测试 (3ms)
- ✅ DevServer 集成测试 (5ms)
- ✅ 覆盖率数据收集测试 (4ms)

## 结论
🎉 所有测试均已通过，插件功能正常！
