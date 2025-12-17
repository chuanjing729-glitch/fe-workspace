# 🎉 新功能说明 (v2.0.0)

## 概述

在 v1.0.0 的基础上，v2.0.0 版本新增了 **7 大核心功能**，并在最新版本中新增 **Vue2 和 JavaScript 深度规范检查**，全面提升代码质量检查能力！

---

## 🆕 新增功能列表

### 1. Vue2 规范检查 ✨ 最新

**功能说明**：
- ✅ 组件命名规范（禁止单个单词）
- ✅ data 必须是函数
- ✅ props 默认值使用工厂函数
- ✅ 生命周期钩子拼写检查
- ✅ 禁止 v-if 与 v-for 同时使用
- ✅ 组件样式 scoped 检查
- ✅ 模糊事件命名检查
- ✅ 组件大小检查（建议 < 400 行）
- ✅ computed 缓存检查
- ✅ watch 深度监听检查
- ✅ props 类型验证
- ✅ v-for key 绑定检查
- ✅ 组件引用未使用检查

**配置方式**：
```javascript
{
  rules: {
    vue: true  // 启用 Vue2 规范检查（13 项）
  }
}
```

**检查示例**：
```vue
// ❌ 错误：组件名单个单词
<script>
export default {
  name: 'Todo'  // 应该使用多个单词，如 'TodoItem'
}
</script>

// ❌ 错误：data 不是函数
<script>
export default {
  data: {  // 应该使用函数：data() { return {} }
    count: 0
  }
}
</script>

// ❌ 错误：props 默认值不是工厂函数
<script>
export default {
  props: {
    tags: {
      type: Array,
      default: []  // 应该使用：default: () => []
    }
  }
}
</script>

// ❌ 错误：生命周期拼写错误
<script>
export default {
  beforeDestory() {  // 拼写错误，应该是 beforeDestroy
    this.cleanup()
  }
}
</script>

// ❌ 错误：v-if 与 v-for 同时使用
<template>
  <div v-for="item in items" v-if="item.visible">
    <!-- 应该使用 computed 过滤 -->
  </div>
</template>
```

[查看完整 Vue2 规范文档](../../../docs/specs/coding/vue2-guide.md)

---

### 2. JavaScript 规范检查 ✨ 最新

**功能说明**：
- ✅ 禁止使用 var（推荐 const/let）
- ✅ 禁止使用 == 和 !=（使用 === 和 !==）
- ✅ 禁止使用字符串拼接（使用模板字符串）
- ✅ 禁止使用 arguments（使用剩余参数）
- ✅ 禁止匿名函数（推荐命名函数）
- ✅ 禁止使用 console.log（生产环境）
- ✅ 禁止使用 eval（安全风险）
- ✅ 未使用变量检查

**配置方式**：
```javascript
{
  rules: {
    javascript: true  // 启用 JavaScript 规范检查（8 项）
  }
}
```

**检查示例**：
```javascript
// ❌ 错误：使用 var
var userName = 'Alice'  // 应该使用 const 或 let

// ❌ 错误：使用 ==
if (value == null) {}  // 应该使用 ===

// ❌ 错误：字符串拼接
const message = 'Hello ' + userName  // 应该使用模板字符串：`Hello ${userName}`

// ❌ 错误：使用 arguments
function sum() {
  return Array.from(arguments).reduce((a, b) => a + b)
}  // 应该使用：function sum(...args) {}

// ❌ 错误：匿名函数
array.map(function(item) {  // 应该使用箭头函数或命名函数
  return item * 2
})

// ❌ 错误：使用 console.log
console.log('debug info')  // 生产环境应该移除

// ❌ 错误：使用 eval
eval('alert(1)')  // 禁止使用 eval，有安全风险
```

[查看完整 JavaScript 规范文档](../../../docs/specs/coding/javascript-typescript-guide.md)

---

### 3. 导入规范检查 ✨

**功能说明**：
- ✅ 循环依赖检测
- ✅ 未使用的导入检测
- ✅ 重复导入检测
- ✅ 导入路径规范检查

**配置方式**：
```javascript
{
  rules: {
    imports: true  // 启用导入规范检查
  }
}
```

**检查示例**：
```javascript
// ❌ 错误：循环依赖
// a.js
import { b } from './b.js'

// b.js  
import { a } from './a.js'  // 检测到循环依赖！

// ❌ 错误：未使用的导入
import { unused } from './utils'  // unused 未使用

// ❌ 错误：重复导入
import { foo } from './foo'
import { bar } from './foo'  // 建议合并导入

// ⚠️ 警告：导入路径嵌套过深
import { utils } from '../../../../../../../utils'  // 建议使用路径别名
```

---

### 2. 变量命名检查 🔤

**功能说明**：
- ✅ 常量使用 UPPER_SNAKE_CASE
- ✅ 变量使用 camelCase
- ✅ 类名使用 PascalCase
- ✅ 布尔变量使用 is/has/should 前缀
- ✅ 私有成员使用 _ 前缀

**配置方式**：
```javascript
{
  rules: {
    variableNaming: true  // 启用变量命名检查
  }
}
```

**检查示例**：
```javascript
// ✅ 正确示例
const MAX_COUNT = 100              // 常量：UPPER_SNAKE_CASE
let userName = 'John'              // 变量：camelCase
class UserService {}               // 类名：PascalCase
const isReady = true               // 布尔变量：is 前缀
class User {
  private _password = ''           // 私有成员：_ 前缀
}

// ❌ 错误示例
const max_count = 100              // 应该：MAX_COUNT
let UserName = 'John'              // 应该：userName
class userService {}               // 应该：UserService
const ready = true                 // 建议：isReady
```

---

### 3. 内存泄漏检查 🔍

**功能说明**：
- ✅ 未清理的定时器检测
- ✅ 未清理的事件监听器检测
- ✅ 全局变量泄漏检测
- ✅ 闭包大对象引用检测

**配置方式**：
```javascript
{
  rules: {
    memoryLeak: true  // 启用内存泄漏检查
  }
}
```

**检查示例**：
```javascript
// ❌ 错误：定时器未清理（Vue 组件）
export default {
  mounted() {
    this.timer = setInterval(() => {
      this.update()
    }, 1000)
  }
  // 缺少 beforeUnmount/beforeDestroy 清理！
}

// ✅ 正确示例
export default {
  mounted() {
    this.timer = setInterval(() => {
      this.update()
    }, 1000)
  },
  beforeUnmount() {
    clearInterval(this.timer)  // 清理定时器
  }
}

// ❌ 错误：事件监听器未清理
mounted() {
  window.addEventListener('resize', this.handleResize)
  // 组件销毁时未移除！
}

// ❌ 错误：全局变量泄漏
window.globalData = { /* 大量数据 */ }  // 可能导致内存泄漏
```

---

### 4. 安全检查 🔒

**功能说明**：
- ✅ XSS 风险检测
- ✅ eval 使用检测
- ✅ 敏感信息泄漏检测
- ✅ 不安全 HTTP 请求检测
- ✅ 不安全随机数检测
- ✅ console.log 敏感信息检测

**配置方式**：
```javascript
{
  rules: {
    security: true  // 启用安全检查
  }
}
```

**检查示例**：
```javascript
// ❌ 错误：XSS 风险
element.innerHTML = userInput  // 可能导致 XSS 攻击

// ❌ 错误：使用 eval
eval(code)  // 禁止使用 eval

// ❌ 错误：敏感信息硬编码
const API_KEY = 'sk-1234567890abcdef'  // 请使用环境变量

// ⚠️ 警告：使用 HTTP（非 HTTPS）
fetch('http://api.example.com/data')  // 建议使用 HTTPS

// ⚠️ 警告：不安全的随机数
const token = Math.random().toString(36)  // 应使用 crypto.getRandomValues()

// ⚠️ 警告：console.log 包含敏感信息
console.log('password:', password)  // 生产环境请移除
```

---

### 5. 文件缓存（性能优化）⚡

**功能说明**：
- ✅ 自动缓存文件检查结果
- ✅ 文件未修改时跳过检查
- ✅ 使用 MD5 哈希判断文件变化
- ✅ 大幅提升检查速度

**工作原理**：
```
第一次检查：
  file.js (100KB) → 检查规则 → 缓存结果

第二次检查（文件未修改）：
  file.js (100KB) → 读取缓存 → 跳过检查 ⚡

性能提升：
  - 小型项目：2-3倍
  - 中型项目：3-5倍
  - 大型项目：5-10倍
```

**缓存位置**：
```
项目根目录/
  └── .spec-cache/
      └── check-cache.json  # 缓存文件
```

**建议**：
- 将 `.spec-cache/` 添加到 `.gitignore`
- CI/CD 环境可以共享缓存提升速度

---

### 6. Git Hooks 集成 🪝

**功能说明**：
- ✅ pre-commit hook：提交前自动检查
- ✅ commit-msg hook：检查 commit message 格式
- ✅ 一键安装脚本
- ✅ 自动更新 package.json

**安装方式**：
```bash
# 方式一：使用 npm script
npm run install-hooks

# 方式二：直接运行脚本
node ./node_modules/@51jbs/webpack-spec-plugin/scripts/install-hooks.js
```

**安装后效果**：
```bash
# 1. 提交代码时自动检查
git commit -m "feat: add feature"

🔍 Running code specification check...
✅ 规范检查通过


# 2. Commit message 格式检查
git commit -m "add feature"  # ❌ 格式错误

❌ Commit message 格式错误
格式要求: <type>(<scope>): <subject>

type 可选值:
  feat:     新功能
  fix:      Bug 修复
  docs:     文档更新
  style:    代码格式调整
  refactor: 代码重构
  test:     测试相关
  chore:    构建/工具相关
  perf:     性能优化

示例: feat(auth): add user login
```

**Commit Message 规范**：
```
格式: <type>(<scope>): <subject>

示例:
  ✅ feat(auth): add user login
  ✅ fix(api): fix data fetching bug
  ✅ docs(readme): update installation guide
  ✅ style(header): adjust button spacing
  ✅ refactor(utils): simplify date function
  ✅ test(login): add unit tests
  ✅ chore(deps): upgrade webpack to 5.89
  ✅ perf(render): optimize rendering performance
```

---

### 7. 自动修复功能 🔧

**功能说明**：
- ✅ 自动修复部分简单问题
- ✅ 支持文件命名修复
- ✅ 支持变量命名修复
- ✅ 支持导入路径修复

**使用方式**（计划中）：
```bash
# 运行检查并自动修复
npm run spec-check --fix

# 或在配置中启用
{
  autoFix: true
}
```

> **注意**：当前版本主要实现了缓存和 Git Hooks 功能，完整的自动修复功能将在后续版本提供。

---

## 📊 完整规则列表

| 规则类别 | 规则数 | 状态 | 配置项 |
|---------|-------|------|--------|
| 文件命名规范 | 5 | ✅ | `naming` |
| 注释规范 | 3 | ✅ | `comments` |
| 性能规范 | 8 | ✅ | `performance` |
| **Vue2 规范** | **13** | **🆕 最新** | `vue` |
| **JavaScript 规范** | **8** | **🆕 最新** | `javascript` |
| **导入规范** | **4** | **🆕** | `imports` |
| **变量命名** | **6** | **🆕** | `variableNaming` |
| **内存泄漏** | **4** | **🆕** | `memoryLeak` |
| **安全检查** | **6** | **🆕** | `security` |
| **总计** | **57** | - | - |

---

## 🚀 升级指南

### 从 v1.0.0 升级到 v2.0.0

1. **更新依赖**：
```bash
npm update @51jbs/webpack-spec-plugin
```

2. **更新配置**（可选，启用新规则）：
```javascript
// spec-plugin.config.js
module.exports = new SpecPlugin({
  mode: 'incremental',
  severity: 'normal',
  rules: {
    // v1.0.0 规则
    naming: true,
    comments: true,
    performance: true,
    
    // v2.0.0 规则
    imports: true,           // ✨ 导入规范
    variableNaming: true,    // ✨ 变量命名
    memoryLeak: true,        // ✨ 内存泄漏
    security: true,          // ✨ 安全检查
    
    // 最新规则
    vue: true,               // ✨ Vue2 规范（13 项）
    javascript: true         // ✨ JavaScript 规范（8 项）
  }
})
```

3. **安装 Git Hooks**（可选）：
```bash
npm run install-hooks
```

4. **清理旧缓存**（可选）：
```bash
rm -rf .spec-cache
```

---

## 💡 最佳实践

### 推荐配置（开发环境）

```javascript
{
  mode: 'incremental',      // 增量检查，速度快
  severity: 'normal',       // 只有错误中断
  rules: {
    naming: true,
    comments: true,
    performance: true,
    imports: true,          // 检查循环依赖
    variableNaming: false,  // 可选，根据团队需要
    memoryLeak: true,       // 防止内存泄漏
    security: true,         // 安全检查
    vue: true,              // Vue2 规范
    javascript: true        // JavaScript 规范
  }
}
```

### 推荐配置（CI/CD环境）

```javascript
{
  mode: 'full',            // 全量检查
  severity: 'strict',      // 严格模式，警告也中断
  rules: {
    // 全部规则启用
    naming: true,
    comments: true,
    performance: true,
    imports: true,
    variableNaming: true,
    memoryLeak: true,
    security: true,
    vue: true,             // Vue2 规范
    javascript: true       // JavaScript 规范
  }
}
```

---

## 📈 性能对比

### v1.0.0 vs v2.0.0

| 项目规模 | v1.0.0 | v2.0.0（无缓存） | v2.0.0（有缓存） | 提升 |
|---------|--------|-----------------|----------------|------|
| 小型 (< 500 文件) | 15s | 18s | **6s** | 2.5倍 |
| 中型 (500-2000 文件) | 35s | 45s | **12s** | 2.9倍 |
| 大型 (> 2000 文件) | 80s | 100s | **20s** | 4倍 |

**性能优化点**：
- ✅ 文件缓存机制
- ✅ 增量检查优化
- ✅ 规则执行优化

---

## 🔧 故障排除

### 问题 1：缓存导致检查结果不更新

**解决方案**：
```bash
# 清除缓存
rm -rf .spec-cache
```

### 问题 2：Git Hooks 不生效

**解决方案**：
```bash
# 重新安装 hooks
npm run install-hooks

# 检查 hooks 权限
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg
```

### 问题 3：规则检查过慢

**解决方案**：
1. 使用增量模式：`mode: 'incremental'`
2. 减少启用的规则
3. 添加更多排除目录：`exclude: ['**/test/**', '**/mock/**']`

---

## 📚 相关文档

- [快速开始指南](./QUICK_START.md)
- [完整文档](./README.md)
- [真实项目测试报告](./REAL_PROJECT_TEST.md)
- [变更日志](./CHANGELOG.md)

---

**🎉 享受全新的代码质量检查体验！**
