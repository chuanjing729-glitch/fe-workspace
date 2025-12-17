# 命名规范

统一的命名规范能够提高代码的可读性和可维护性，降低团队协作成本。

## 基本原则

1. **一致性** - 同类元素使用相同的命名风格
2. **可读性** - 名称应清晰表达意图和用途
3. **简洁性** - 在表达清楚的前提下尽量简洁
4. **避免误导** - 不使用容易引起歧义的命名

## 变量和函数命名

### JavaScript/TypeScript 命名

```javascript
// ✅ 推荐
const userName = 'zhangsan'           // 变量：camelCase
const MAX_COUNT = 100                 // 常量：UPPER_SNAKE_CASE
const API_BASE_URL = '/api/v1'        // API常量：UPPER_SNAKE_CASE

class UserService {                   // 类：PascalCase
  getUserInfo() {}                    // 方法：camelCase
  private _internalMethod() {}        // 私有方法：下划线前缀
}

function fetchUserData() {}           // 函数：动词开头
function handleClick() {}             // 事件处理：handle + 动词
function formatDate() {}              // 工具函数：动词开头

// ❌ 禁止
const UserName = 'zhangsan'           // 变量用PascalCase
const maxcount = 100                  // 常量用小写
```

### Vue 组件命名

```vue
<!-- ✅ 推荐 -->
<script>
export default {
  name: 'UserProfile',              // 组件名：PascalCase
  components: {
    UserCard,                        // 注册组件：PascalCase
    EhResumeCard                     // 业务组件：业务前缀 + PascalCase
  },
  props: {
    userId: String,                  // prop：camelCase
    isActive: Boolean
  },
  data() {
    return {
      userName: '',                  // data：camelCase
      userList: []
    }
  },
  computed: {
    fullName() {}                    // computed：camelCase
  },
  methods: {
    handleClick() {},                // 方法：handle + 动词
    fetchUserData() {},              // 请求：fetch/get/post等
    formatDate() {}                  // 工具：动词开头
  }
}
</script>

<!-- 使用时 -->
<template>
  <user-card :user-id="userId" />   <!-- kebab-case -->
  <!-- 或 -->
  <UserCard :userId="userId" />     <!-- PascalCase -->
</template>
```

## 文件命名

### 通用规则

- 使用小写字母
- 单词间使用连字符 `-` 分隔（kebab-case）
- 避免特殊字符（空格、括号、中文等）
- 文件名应具有描述性

```bash
# ✅ 推荐
user-profile.vue
api-client.js
style-guide.md
login-form.vue

# ❌ 禁止
userProfile.vue          # 驼峰命名
user_profile.vue         # 下划线分隔
User Profile.vue         # 包含空格
用户资料.vue              # 中文字符
```

### Vue 组件文件

Vue 组件文件使用大驼峰命名法（PascalCase）：

```bash
# ✅ 推荐
UserProfile.vue
NavigationMenu.vue
DataTable.vue
ModalDialog.vue

# ❌ 禁止
user-profile.vue         # 连字符命名
userProfile.vue          # 小驼峰命名
navigation_menu.vue      # 下划线命名
```

### JavaScript/TypeScript 文件

普通 JavaScript/TypeScript 文件使用连字符分隔：

```bash
# ✅ 推荐
api-client.js
data-processor.ts
utils.js
event-handler.ts

# ❌ 禁止
apiClient.js             # 驼峰命名
ApiClient.js             # 大驼峰命名
api_client.js            # 下划线命名
```

### 样式文件

CSS/SCSS/LESS 文件使用连字符分隔：

```bash
# ✅ 推荐
main-layout.scss
button-styles.css
responsive-design.less

# ❌ 禁止
mainLayout.scss          # 驼峰命名
MainLayout.scss          # 大驼峰命名
main_layout.scss         # 下划线命名
```

### 配置文件

配置文件通常使用点号开头或特定的命名方式：

```bash
# ✅ 推荐
.eslintrc.js
.prettierrc.js
.babelrc
.gitignore
.dockerignore

# 项目配置文件
webpack.config.js
vite.config.ts
jest.config.js
```

### 测试文件

测试文件在其源文件名后加上 `.test` 或 `.spec` 后缀：

```bash
# 源文件
UserProfile.vue
api-client.js
utils.ts

# 对应的测试文件
UserProfile.test.vue
api-client.test.js
utils.spec.ts
```

## 目录命名

### 组件目录

组件目录使用小写连字符命名：

```bash
# ✅ 推荐
components/
  ├── user-profile/
  ├── navigation-menu/
  ├── data-table/
  └── modal-dialog/

# ❌ 禁止
components/
  ├── UserProfile/         # 大驼峰命名
  ├── navigationMenu/      # 驼峰命名
  ├── navigation_menu/     # 下划线命名
```

### 页面目录

页面目录使用小写连字符命名：

```bash
# ✅ 推荐
views/
  ├── user-dashboard/
  ├── product-list/
  ├── order-management/
  └── settings-page/

# 或按功能模块组织
views/
  ├── user/
  │   ├── profile/
  │   ├── settings/
  │   └── preferences/
  └── admin/
      ├── dashboard/
      ├── users/
      └── reports/
```

### 工具函数目录

工具函数目录使用复数形式：

```bash
# ✅ 推荐
utils/
  ├── formatters/
  ├── validators/
  ├── helpers/
  └── constants/

# 或按功能分组
utils/
  ├── date-utils/
  ├── string-utils/
  ├── array-utils/
  └── dom-utils/
```

## 特殊文件命名

### 索引文件

在目录中使用 `index` 作为入口文件名：

```bash
components/
  ├── user-profile/
  │   ├── index.vue          # 组件入口
  │   ├── UserProfile.vue    # 主组件
  │   └── UserProfile.types.ts # 类型定义
  └── index.js               # 组件导出入口
```

### 类型定义文件

TypeScript 类型定义文件使用 `.d.ts` 或 `.types.ts` 后缀：

```bash
# 类型声明文件
types/
  ├── user.d.ts
  ├── api-response.d.ts
  └── component-props.d.ts

# 或者与组件同目录
UserProfile/
  ├── UserProfile.vue
  └── UserProfile.types.ts
```

## 包命名

### npm 包命名

npm 包使用连字符分隔，并遵循作用域命名：

```bash
# ✅ 推荐
@fe-efficiency/fe-toolkit
@fe-efficiency/ui-components
@fe-efficiency/api-client

# 包内部文件
packages/
  ├── fe-toolkit/
  │   ├── package.json     # name: "@fe-efficiency/fe-toolkit"
  │   └── src/
  └── ui-components/
      ├── package.json     # name: "@fe-efficiency/ui-components"
      └── src/
```

## 注意事项

1. **避免缩写**：除非是广泛认知的缩写（如 `id`、`url`、`api`），否则使用完整单词
2. **避免无意义复数**：除非确实表示多个实体
3. **避免版本号**：不要在文件名中包含版本号
4. **避免日期**：不要在文件名中包含日期（使用版本控制历史）

```bash
# ✅ 推荐
user-service.js
config.js
readme.md

# ❌ 禁止
usr-srv.js               # 过度缩写
users.js                 # 如果只处理单个用户
config-v1.js             # 包含版本号
report-2023-01-01.js     # 包含日期
```

遵循这些命名规范有助于提高代码库的可维护性和团队协作效率。
