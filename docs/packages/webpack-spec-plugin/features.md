# 功能特性

## 📊 检查维度总览

Webpack 规范检查插件提供 **7 大检查维度**，共 **36 项检查规则**。

| 检查维度 | 规则数 | 配置项 | 说明 |
|---------|-------|--------|------|
| 文件命名规范 | 5 | `naming` | 文件命名格式检查 |
| 注释规范 | 3 | `comments` | 代码注释完整性检查 |
| 性能规范 | 8 | `performance` | 资源大小、性能优化检查 |
| 导入规范 | 4 | `imports` | 模块导入合理性检查 |
| 变量命名 | 6 | `variableNaming` | 变量命名规范检查 |
| 内存泄漏 | 4 | `memoryLeak` | 内存泄漏风险检测 |
| 安全检查 | 6 | `security` | 安全风险检测 |

## 1. 文件命名规范 (naming)

检查文件命名是否符合团队规范。

### 检查规则

- ✅ Vue 组件文件使用 `PascalCase`（如 `UserProfile.vue`）
- ✅ JavaScript 文件使用 `kebab-case`（如 `user-service.js`）
- ✅ 测试文件使用 `.test.js` 或 `.spec.js` 后缀
- ✅ 目录命名规范
- ✅ 特殊字符检测

### 示例

```
✅ 正确：
  - UserProfile.vue
  - user-service.js
  - user-service.test.js

❌ 错误：
  - userProfile.vue      // 应该: UserProfile.vue
  - UserService.js       // 应该: user-service.js
  - user_service.js      // 应该: user-service.js
```

## 2. 注释规范 (comments)

检查复杂函数是否有足够的注释。

### 检查规则

- ✅ 函数参数 ≥ 4 个，必须有注释
- ✅ 函数行数 > 10 行，必须有注释
- ✅ 公共 API 必须有注释
- ✅ TODO/FIXME 格式检查
- ✅ 大段注释代码检测

### 示例

```javascript
// ✅ 正确：复杂函数有注释
/**
 * 处理用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {boolean} remember - 是否记住登录
 * @param {Object} options - 额外选项
 * @returns {Promise<User>}
 */
function handleLogin(username, password, remember, options) {
  // ... 复杂逻辑
}

// ❌ 错误：缺少注释
function handleLogin(username, password, remember, options) {
  // ... 复杂逻辑（>10 行）
}
```

## 3. 性能规范 (performance)

检查资源大小是否超出预算。

### 检查规则

- ✅ 图片大小限制（默认 ≤ 500 KB）
- ✅ JavaScript 文件大小限制（默认 ≤ 300 KB）
- ✅ CSS 文件大小限制（默认 ≤ 100 KB）
- ✅ 字体文件大小限制（默认 ≤ 200 KB）
- ✅ 懒加载使用检查
- ✅ 防抖/节流检查
- ✅ 循环 DOM 操作检查
- ✅ CSS 选择器复杂度检查

### 默认预算

```javascript
{
  maxImageSize: 500,  // KB
  maxJsSize: 300,     // KB
  maxCssSize: 100,    // KB
  maxFontSize: 200    // KB
}
```

### 示例

```
❌ banner.jpg (1.2 MB) - 超出预算 700 KB
⚠️ app.js (280 KB) - 接近预算上限（93%）
✅ style.css (45 KB) - 正常
```

## 4. 导入规范 (imports)

检查模块导入的合理性。

### 检查规则

- ✅ 循环依赖检测
- ✅ 未使用的导入检测
- ✅ 重复导入检测
- ✅ 导入路径深度检查

### 示例

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

// ✅ 正确：合并导入
import { foo, bar } from './foo'

// ⚠️ 警告：导入路径嵌套过深
import { utils } from '../../../../../../../utils'  // 建议使用路径别名
```

## 5. 变量命名 (variableNaming)

检查变量命名是否符合规范。

### 检查规则

- ✅ 常量使用 `UPPER_SNAKE_CASE`
- ✅ 变量使用 `camelCase`
- ✅ 类名使用 `PascalCase`
- ✅ 布尔变量使用 `is/has/should` 前缀
- ✅ 私有成员使用 `_` 前缀
- ✅ 函数参数命名检查

### 示例

```javascript
// ✅ 正确示例
const MAX_COUNT = 100              // 常量：UPPER_SNAKE_CASE
let userName = 'John'              // 变量：camelCase
class UserService {}               // 类名：PascalCase
const isReady = true               // 布尔变量：is 前缀
const hasPermission = false        // 布尔变量：has 前缀
class User {
  private _password = ''           // 私有成员：_ 前缀
}

// ❌ 错误示例
const max_count = 100              // 应该：MAX_COUNT
let UserName = 'John'              // 应该：userName
class userService {}               // 应该：UserService
const ready = true                 // 建议：isReady
```

## 6. 内存泄漏检查 (memoryLeak)

检测可能导致内存泄漏的代码。

### 检查规则

- ✅ 未清理的定时器检测
- ✅ 未清理的事件监听器检测
- ✅ 全局变量泄漏检测
- ✅ 闭包大对象引用检测

### 示例

#### 定时器泄漏

```javascript
// ❌ 错误：定时器未清理
export default {
  mounted() {
    this.timer = setInterval(() => {
      this.update()
    }, 1000)
  }
  // 缺少 beforeUnmount/beforeDestroy 清理！
}

// ✅ 正确：清理定时器
export default {
  mounted() {
    this.timer = setInterval(() => {
      this.update()
    }, 1000)
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
```

#### 事件监听器泄漏

```javascript
// ❌ 错误：事件监听器未清理
mounted() {
  window.addEventListener('resize', this.handleResize)
  // 组件销毁时未移除！
}

// ✅ 正确：清理事件监听器
mounted() {
  window.addEventListener('resize', this.handleResize)
},
beforeUnmount() {
  window.removeEventListener('resize', this.handleResize)
}
```

#### 全局变量泄漏

```javascript
// ❌ 错误：全局变量污染
window.globalData = { /* 大量数据 */ }  // 可能导致内存泄漏

// ✅ 正确：使用模块化或 Vuex
export const globalData = { /* 数据 */ }
```

## 7. 安全检查 (security)

检测常见安全风险。

### 检查规则

- ✅ XSS 风险检测（innerHTML）
- ✅ eval 使用检测
- ✅ 敏感信息硬编码检测
- ✅ 不安全 HTTP 请求检测
- ✅ 不安全随机数检测
- ✅ console.log 敏感信息检测

### 示例

```javascript
// ❌ 错误：XSS 风险
element.innerHTML = userInput  // 可能导致 XSS 攻击

// ✅ 正确：使用安全方法
element.textContent = userInput

// ❌ 错误：使用 eval
eval(code)  // 禁止使用 eval

// ❌ 错误：敏感信息硬编码
const API_KEY = 'sk-1234567890abcdef'  // 请使用环境变量
const PASSWORD = 'admin123'

// ✅ 正确：使用环境变量
const API_KEY = process.env.API_KEY
const PASSWORD = process.env.PASSWORD

// ⚠️ 警告：使用 HTTP（非 HTTPS）
fetch('http://api.example.com/data')  // 建议使用 HTTPS

// ⚠️ 警告：不安全的随机数
const token = Math.random().toString(36)  // 应使用 crypto.getRandomValues()

// ⚠️ 警告：console.log 包含敏感信息
console.log('password:', password)  // 生产环境请移除
console.log('token:', token)
```

## 🎨 HTML 报告功能

### 报告内容

#### 1. 整体总结

- ✅ 错误和警告数量统计
- ✅ 问题分类统计
- ✅ 优先级建议（P0/P1/P2）
- ✅ 检查覆盖率

#### 2. 问题详情

- ✅ 文件路径和行号
- ✅ 问题描述
- ✅ 优先级标签
- ✅ 规则类型

#### 3. 修复方案

- ✅ 详细修复步骤
- ✅ 代码示例（修改前/修改后）
- ✅ 最佳实践建议
- ✅ 相关文档链接

#### 4. 统计图表

- ✅ 问题类型分布
- ✅ 文件问题密度
- ✅ 优先级分布

### 报告示例

```html
📊 检查概览
本次检查共发现 8 个错误 和 20 个警告

📈 问题分类
- 内存泄漏: 6 个
- 安全风险: 1 个
- 性能问题: 9 个
- 导入规范: 12 个

⚠️ 优先级建议
- P0 (高优先级): 8 个 - 需要立即修复
- P1 (中优先级): 15 个 - 建议尽快修复
- P2 (低优先级): 5 个 - 可以延后处理
```

## ⚡ 性能优化

### 缓存机制

插件使用智能缓存，大幅提升检查速度：

```
第一次检查：100 个文件 → 15s
第二次检查（未修改）：100 个文件 → 3s ⚡ (5倍提升)
```

### 性能对比

| 项目规模 | 无缓存 | 有缓存 | 提升 |
|---------|-------|-------|------|
| 小型 (< 500 文件) | 18s | 6s | 3倍 |
| 中型 (500-2000 文件) | 45s | 12s | 3.8倍 |
| 大型 (> 2000 文件) | 100s | 20s | 5倍 |

### 缓存文件位置

```
项目根目录/
  └── .spec-cache/
      ├── spec-report.html      # HTML 报告
      └── check-cache.json      # 检查缓存
```

**建议**：将 `.spec-cache/` 添加到 `.gitignore`

## 🪝 Git Hooks 集成

### 功能

- ✅ **pre-commit hook**: 提交前自动检查
- ✅ **commit-msg hook**: 检查 commit message 格式
- ✅ 一键安装脚本
- ✅ 自动更新 package.json

### 使用效果

```bash
# 提交代码时自动检查
git commit -m "feat: add feature"

🔍 Running code specification check...
✅ 规范检查通过

# Commit message 格式检查
git commit -m "add feature"  # ❌ 格式错误

❌ Commit message 格式错误
格式要求: <type>(<scope>): <subject>

示例: feat(auth): add user login
```

### Commit Message 规范

```
格式: <type>(<scope>): <subject>

type 可选值:
  feat:     新功能
  fix:      Bug 修复
  docs:     文档更新
  style:    代码格式调整
  refactor: 代码重构
  test:     测试相关
  chore:    构建/工具相关
  perf:     性能优化

示例:
  ✅ feat(auth): add user login
  ✅ fix(api): fix data fetching bug
  ✅ docs(readme): update installation guide
```

## 📈 版本历史

### v2.0.0 (2025-12-15)

**新增功能**:
- ✨ 导入规范检查（4项规则）
- ✨ 变量命名检查（6项规则）
- ✨ 内存泄漏检查（4项规则）
- ✨ 安全检查（6项规则）
- ⚡ 文件缓存机制（性能提升 3-10 倍）
- 🪝 Git Hooks 集成

**总规则数**: 36 项（v1.0: 16 项 → v2.0: 36 项，+125%）

### v1.0.0 (2025-12-14)

**初始版本**:
- ✅ 文件命名检查（5项规则）
- ✅ 注释规范检查（3项规则）
- ✅ 性能规范检查（8项规则）
- ✅ HTML 报告生成
- ✅ 增量/全量检查模式

## 📚 相关文档

- [快速开始](./quick-start.md) - 快速上手指南
- [检查规则详解](./index.md#检查维度总览) - 所有规则说明
- [配置指南](./index.md#配置选项) - 配置选项说明
- [更新日志](./changelog.md) - 版本更新记录
- [真实项目验证](./validation-report.md) - 实际测试结果
