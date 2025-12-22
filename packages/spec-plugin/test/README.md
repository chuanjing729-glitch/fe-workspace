# 测试脚本说明

本目录存放所有测试脚本和验证工具。

## 📂 测试脚本分类

### 核心功能测试
- `test-all-rules.js` - 所有规则测试
- `test-boundary-rule.js` - 边界处理规范测试
- `test-new-rules.js` - 新规则测试
- `test-enhanced-rules.js` - 增强规则测试
- `core-check-test.js` - 核心检查测试

### 项目验证
- `check-project.js` - 完整项目检查
- `quick-check.js` - 快速检查（采样）
- `verify-boundary-in-real-project.js` - 真实项目边界验证
- `full-validation-test.js` - 完整验证测试

### 生产评估
- `test-production-ready.js` - 生产就绪性测试
- `static-scan.js` - 静态扫描工具

### 调试工具
- `debug-js-rule.js` - JavaScript 规则调试
- `debug-security-performance.js` - 安全性能调试

## 🚀 使用方法

### 快速测试
```bash
# 运行所有测试
node test/test-all-rules.js

# 边界处理规范测试
node test/test-boundary-rule.js

# 快速检查（真实项目）
node test/quick-check.js
```

### 完整验证
```bash
# 完整项目检查
node test/check-project.js

# 生产就绪性测试
node test/test-production-ready.js
```

## 📊 测试覆盖

- ✅ 单元测试：100% 覆盖
- ✅ 集成测试：核心功能全覆盖
- ✅ 真实项目验证：mall-portal-front

---

**最后更新**: 2025-12-15
