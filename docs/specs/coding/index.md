# 代码编写规范

统一的代码编写规范能够提高代码质量，降低维护成本，提升团队协作效率。

## 规范列表

### [命名规范](/fe-workspace/specs/coding/naming.md)
规范文件、变量、函数、组件等的命名约定，确保命名的一致性和可读性。

**核心内容：**
- 变量和函数命名规则（camelCase、PascalCase、UPPER_CASE）
- 文件命名规则（kebab-case、PascalCase）
- 目录命名规则
- 包命名规则

### [JavaScript/TypeScript 规范](/fe-workspace/specs/coding/javascript.md)
JavaScript 和 TypeScript 的编码标准和最佳实践。

**核心内容：**
- 语言特性使用规范
- 代码风格和格式
- 类型定义规范
- 错误处理规范

### [Vue 组件规范](/fe-workspace/specs/coding/vue.md)
Vue 2/3 组件开发的规范和最佳实践。

**核心内容：**
- 组件结构规范
- 组件通信规范
- 生命周期使用规范
- 响应式数据规范

### [CSS 样式规范](/fe-workspace/specs/coding/css.md)
CSS/SCSS/LESS 编写规范，包括命名、组织、响应式设计等。

**核心内容：**
- CSS 命名规范（BEM、语义化命名）
- 代码组织规范
- 响应式设计规范
- 性能优化建议

### [注释规范](/fe-workspace/specs/coding/comments.md)
代码注释和文档注释的标准。

**核心内容：**
- 单行和多行注释规范
- JSDoc 文档注释规范
- Vue 组件注释规范
- 特殊标记注释（TODO、FIXME等）

## 快速参考

### 常用命名约定

```javascript
// 变量和函数：camelCase
const userName = 'zhangsan'
function getUserInfo() {}

// 常量：UPPER_SNAKE_CASE
const MAX_COUNT = 100
const API_BASE_URL = '/api'

// 类和组件：PascalCase
class UserService {}
// UserProfile.vue

// 文件：kebab-case（除 Vue 组件外）
// api-client.js
// user-service.ts
```

### 代码格式化工具

推荐使用以下工具确保代码风格一致：

- **ESLint** - JavaScript/TypeScript 代码检查
- **Prettier** - 代码格式化
- **Stylelint** - CSS/SCSS 代码检查

### 编辑器配置

建议在项目中添加 `.editorconfig` 文件：

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

## 相关规范

- [工程化规范](/fe-workspace/specs/engineering/index.md) - Git工作流、代码审查、测试规范
- [设计规范](/fe-workspace/specs/design/index.md) - 技术方案设计、架构设计
- [优化规范](/fe-workspace/specs/optimization/index.md) - 性能优化、内存管理
