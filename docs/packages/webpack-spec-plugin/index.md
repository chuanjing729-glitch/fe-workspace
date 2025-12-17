# Webpack 规范检查插件

## 📖 简介

Webpack 规范检查插件是一款强大的前端代码质量检查工具，集成在 Webpack 构建流程中，自动检测代码规范、性能、安全等问题，提升代码质量。

## ✨ 核心特性

### 🎯 7 大检查维度

- **文件命名规范** - 确保文件命名遵循团队规范
- **注释规范** - 检查代码注释的完整性和规范性
- **性能检查** - 检测性能隐患（图片大小、资源体积等）
- **导入规范** - 检测循环依赖、未使用导入、重复导入
- **变量命名** - 检查变量命名是否符合规范（camelCase、PascalCase等）
- **内存泄漏** - 检测定时器、事件监听器等内存泄漏风险
- **安全检查** - 检测 XSS、eval、敏感信息泄漏等安全风险

### ⚡ 高性能

- **增量检查** - 只检查 Git 变更文件
- **智能缓存** - 未修改文件跳过检查，性能提升 3-10 倍
- **并行处理** - 多文件并行检查

### 📊 可视化报告

- **HTML 报告** - 美观的可视化报告
- **整体总结** - 问题分类、优先级标签
- **修复方案** - 详细的修复步骤和代码示例
- **代码对比** - 修改前/修改后对比展示

### 🔧 开发友好

- **Git Hooks 集成** - 提交前自动检查
- **CI/CD 支持** - 无缝集成到构建流程
- **灵活配置** - 按需启用/禁用规则

## 📦 安装

```bash
npm install @51jbs/webpack-spec-plugin --save-dev
```

## 🚀 快速开始

### 基础使用

```javascript
// webpack.config.js
const SpecPlugin = require('@51jbs/webpack-spec-plugin')

module.exports = {
  plugins: [
    new SpecPlugin()
  ]
}
```

### 开发环境配置

```javascript
// webpack.dev.js
new SpecPlugin({
  mode: 'incremental',  // 只检查变更文件
  severity: 'normal',   // 只有错误才中断
  rootDir: __dirname
})
```

### 生产环境配置

```javascript
// webpack.prod.js
new SpecPlugin({
  mode: 'full',         // 检查所有文件
  severity: 'strict',   // 警告也中断构建
  rootDir: __dirname
})
```

## 📋 检查规则详解

### 1. 文件命名规范 (naming)

检查文件命名是否符合团队规范。

**规则**：
- Vue 组件文件使用 `PascalCase`（如 `UserProfile.vue`）
- JavaScript 文件使用 `kebab-case`（如 `user-service.js`）
- 测试文件使用 `.test.js` 或 `.spec.js` 后缀

**示例**：
```
✅ UserProfile.vue
✅ user-service.js
✅ user-service.test.js

❌ userProfile.vue
❌ UserService.js
```

### 2. 注释规范 (comments)

检查复杂函数是否有足够的注释。

**规则**：
- 函数参数 ≥ 4 个，必须有注释
- 函数行数 > 10 行，必须有注释
- 公共 API 必须有注释

**示例**：
```javascript
// ✅ 正确：复杂函数有注释
/**
 * 处理用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {boolean} remember - 是否记住登录
 * @returns {Promise<User>}
 */
function handleLogin(username, password, remember) {
  // ...
}

// ❌ 错误：缺少注释
function handleLogin(username, password, remember) {
  // ... 复杂逻辑
}
```

### 3. 性能检查 (performance)

检查资源大小是否超出预算。

**默认预算**：
- 图片：≤ 500 KB
- JavaScript：≤ 300 KB
- CSS：≤ 100 KB
- 字体：≤ 200 KB

**示例**：
```
❌ banner.jpg (1.2 MB) - 超出预算 700 KB
⚠️ app.js (280 KB) - 接近预算上限
✅ style.css (45 KB)
```

### 4. 导入规范 (imports)

检查模块导入的合理性。

**检查项**：
- 循环依赖
- 未使用的导入
- 重复导入
- 导入路径深度

**示例**：
```javascript
// ❌ 错误：循环依赖
// a.js → b.js → a.js

// ❌ 错误：未使用的导入
import { unused } from './utils'

// ❌ 错误：重复导入
import { foo } from './foo'
import { bar } from './foo'  // 建议合并

// ✅ 正确：合并导入
import { foo, bar } from './foo'
```

### 5. 变量命名 (variableNaming)

检查变量命名规范。

**规则**：
- 常量：`UPPER_SNAKE_CASE`
- 变量：`camelCase`
- 类名：`PascalCase`
- 布尔值：`is/has/should` 前缀
- 私有成员：`_` 前缀

**示例**：
```javascript
// ✅ 正确
const MAX_COUNT = 100
let userName = 'John'
class UserService {}
const isReady = true
class User {
  private _password = ''
}

// ❌ 错误
const max_count = 100     // 应该：MAX_COUNT
let UserName = 'John'     // 应该：userName
class userService {}      // 应该：UserService
const ready = true        // 建议：isReady
```

### 6. 内存泄漏检查 (memoryLeak)

检测可能导致内存泄漏的代码。

**检查项**：
- 未清理的定时器
- 未清理的事件监听器
- 全局变量泄漏
- 闭包大对象引用

**示例**：
```javascript
// ❌ 错误：定时器未清理
export default {
  mounted() {
    this.timer = setInterval(() => {
      this.update()
    }, 1000)
  }
  // 缺少 beforeUnmount 清理
}

// ✅ 正确
export default {
  mounted() {
    this.timer = setInterval(() => {
      this.update()
    }, 1000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  }
}
```

### 7. 安全检查 (security)

检测常见安全风险。

**检查项**：
- XSS 风险（innerHTML）
- eval 使用
- 敏感信息硬编码
- 不安全 HTTP 请求
- 不安全随机数
- console.log 敏感信息

**示例**：
```javascript
// ❌ 错误：XSS 风险
element.innerHTML = userInput

// ❌ 错误：使用 eval
eval(code)

// ❌ 错误：敏感信息硬编码
const API_KEY = 'sk-1234567890abcdef'

// ✅ 正确：使用环境变量
const API_KEY = process.env.API_KEY
```

## 📊 HTML 报告

插件会生成详细的 HTML 报告，包含：

### 报告内容

1. **整体总结**
   - 错误和警告数量
   - 问题分类统计
   - 优先级建议

2. **问题详情**
   - 文件路径和行号
   - 问题描述
   - 优先级标签（P0/P1/P2）

3. **修复方案**
   - 详细修复步骤
   - 代码示例（修改前/修改后）
   - 最佳实践建议

4. **统计图表**
   - 问题类型分布
   - 文件问题密度

### 查看报告

```bash
# 构建后自动生成报告
npm run build

# 打开报告
open .spec-cache/spec-report.html
```

## 🔧 配置选项

### 完整配置

```javascript
{
  // 检查模式:'incremental' | 'full'
  mode: 'incremental' | 'full',
  
  // 严格程度：'normal' | 'strict'
  severity: 'normal' | 'strict',
  
  // 规则开关
  rules: {
    naming: boolean, // 文件命名检查
    comments: boolean, // 注释规范检查
    performance: boolean, // 性能检查
    imports: boolean, // 导入规范检查
    variableNaming: boolean, // 变量命名检查
    memoryLeak: boolean, /// 内存泄漏检查
    security: boolean, // 安全检查
  },
  
  // 性能预算
  performanceBudget: {
    maxImageSize: number,  // KB
    maxJsSize: number,     // KB
    maxCssSize: number,    // KB
    maxFontSize: number    // KB
  },
  
  // HTML 报告
  htmlReport: boolean,
  reportPath: string,
  
  // 排除文件
  exclude: string[],
  rootDir: string
}
```

### 配置示例

```javascript
// 严格模式
{
  mode: 'full',
  severity: 'strict',
  rules: {
    naming: true,
    comments: true,
    performance: true,
    imports: true,
    variableNaming: true,
    memoryLeak: true,
    security: true
  },
  performanceBudget: {
    maxImageSize: 300,
    maxJsSize: 200,
    maxCssSize: 50,
    maxFontSize: 100
  },
  rootDir: __dirname
}

// 宽松模式
{
  mode: 'incremental',
  severity: 'normal',
  rules: {
    naming: true,
    comments: false,
    performance: true,
    imports: true,
    variableNaming: false,
    memoryLeak: true,
    security: true
  },
  rootDir: __dirname
}
```

## 🪝 Git Hooks 集成

### 安装 Hooks

```bash
# 方式一：使用 npm script
npm run install-hooks

# 方式二：直接运行脚本
node ./node_modules/@51jbs/webpack-spec-plugin/scripts/install-hooks.js
```

### 自动检查

安装后，提交代码时会自动检查：

```bash
git commit -m "feat: add feature"

🔍 Running code specification check...
✅ 规范检查通过
```

### Commit Message 规范

Hooks 还会检查 commit message 格式：

```bash
# ✅ 正确格式
git commit -m "feat(auth): add user login"
git commit -m "fix(api): fix data fetching bug"
git commit -m "docs(readme): update installation guide"

# ❌ 错误格式
git commit -m "add feature"
git commit -m "fix bug"
```

**格式规范**：
```
<type>(<scope>): <subject>

type 可选值：
- feat:     新功能
- fix:      Bug 修复
- docs:     文档更新
- style:    代码格式调整
- refactor: 代码重构
- test:     测试相关
- chore:    构建/工具相关
- perf:     性能优化
```

## 🎯 使用场景

### 场景 1：本地开发

```javascript
// webpack.dev.js
{
  mode: 'incremental',  // 快速检查
  severity: 'normal',   // 不阻塞开发
  htmlReport: true
}
```

### 场景 2：代码提交

```bash
# 安装 Git Hooks
npm run install-hooks

# 提交时自动检查
git commit -m "feat: add feature"
```

### 场景 3：CI/CD 流程

```javascript
// webpack.prod.js
{
  mode: 'full',         // 全量检查
  severity: 'strict',   // 严格模式
  htmlReport: true
}
```

```yaml
# .github/workflows/ci.yml
- name: Build with spec check
  run: npm run build
  
- name: Upload spec report
  uses: actions/upload-artifact@v2
  with:
    name: spec-report
    path: .spec-cache/spec-report.html
```

## 📈 性能优化

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

### 缓存文件

```
项目根目录/
  └── .spec-cache/
      ├── spec-report.html      # HTML 报告
      └── check-cache.json      # 检查缓存
```

**建议**：将 `.spec-cache/` 添加到 `.gitignore`

## 💡 最佳实践

### 1. 渐进式接入

```javascript
// 第一阶段：启用基础规则
{
  rules: {
    naming: true,
    performance: true
  }
}

// 第二阶段：增加安全检查
{
  rules: {
    naming: true,
    performance: true,
    security: true,
    memoryLeak: true
  }
}

// 第三阶段：全量启用
{
  rules: {
    naming: true,
    comments: true,
    performance: true,
    imports: true,
    variableNaming: true,
    memoryLeak: true,
    security: true
  }
}
```

### 2. 分环境配置

```javascript
// 开发环境：快速反馈
const devConfig = {
  mode: 'incremental',
  severity: 'normal',
  rules: {
    naming: true,
    performance: true,
    memoryLeak: true,
    security: true
  }
}

// 生产环境：严格检查
const prodConfig = {
  mode: 'full',
  severity: 'strict',
  rules: {
    naming: true,
    comments: true,
    performance: true,
    imports: true,
    variableNaming: true,
    memoryLeak: true,
    security: true
  }
}
```

### 3. 合理设置预算

```javascript
{
  performanceBudget: {
    maxImageSize: 500,    // 根据项目调整
    maxJsSize: 300,
    maxCssSize: 100,
    maxFontSize: 200
  }
}
```

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

# 检查权限
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg
```

### 问题 3：检查速度慢

**解决方案**：
1. 使用增量模式：`mode: 'incremental'`
2. 减少启用的规则
3. 添加更多排除目录：
   ```javascript
   {
     exclude: [
       'node_modules/**',
       'dist/**',
       '**/*.test.js',
       '**/mock/**'
     ]
   }
   ```

### 问题 4：报告文件找不到

**解决方案**：
检查配置中的 `reportPath`：
```javascript
{
  htmlReport: true,
  reportPath: '.spec-cache/spec-report.html'  // 确保路径正确
}
```

## 📚 更多文档

- [快速开始](/fe-workspace/packages/webpack-spec-plugin/quick-start) - 快速上手指南
- [完整功能列表](/fe-workspace/packages/webpack-spec-plugin/features) - 所有功能详解
- [更新日志](/fe-workspace/packages/webpack-spec-plugin/changelog) - 版本更新记录
- [真实项目验证报告](/fe-workspace/packages/webpack-spec-plugin/validation-report) - 实际测试结果

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT
