# 空指针防护规范

> 本规范旨在帮助团队避免常见的空指针访问错误（如 "Cannot read property 'xxx' of undefined"），提高代码的健壮性和可靠性。

---

## 📋 目录

- [为什么需要空指针防护](#为什么需要空指针防护)
- [常见空指针错误](#常见空指针错误)
- [防护策略](#防护策略)
  - [可选链操作符](#可选链操作符)
  - [空值合并操作符](#空值合并操作符)
  - [提前检查](#提前检查)
  - [默认值处理](#默认值处理)
- [具体规范](#具体规范)
  - [属性访问](#属性访问)
  - [数组访问](#数组访问)
  - [函数调用](#函数调用)
  - [API 响应处理](#api-响应处理)
  - [DOM 元素操作](#dom-元素操作)
  - [解构赋值](#解构赋值)
  - [Vue Props 访问](#vue-props-访问)

---

## 为什么需要空指针防护

### 常见错误信息

```
❌ Cannot read property 'name' of undefined
❌ Cannot read property 'length' of null
❌ xxx is not a function
❌ Cannot read property 'data' of undefined
```

### 错误原因分析

1. **未检查对象是否存在** - 直接访问可能为 null/undefined 的对象属性
2. **API 数据未加载** - 异步数据加载完成前就访问数据
3. **数组越界** - 访问不存在的数组索引
4. **Props 未传递** - Vue 组件 props 没有默认值
5. **DOM 元素未找到** - querySelector 返回 null

---

## 常见空指针错误

### 示例 1：对象属性访问

```javascript
// ❌ 错误：未检查对象存在性
function getUserEmail(user) {
  return user.profile.email  // user 或 profile 可能为 undefined
}

// ✅ 正确：使用可选链
function getUserEmail(user) {
  return user?.profile?.email
}
```

### 示例 2：数组访问

```javascript
// ❌ 错误：未检查数组长度
function getFirstItem(arr) {
  return arr[0].name  // arr 可能为空数组
}

// ✅ 正确：检查长度
function getFirstItem(arr) {
  return arr && arr.length > 0 ? arr[0].name : null
}

// ✅ 更好：使用可选链
function getFirstItem(arr) {
  return arr?.[0]?.name
}
```

### 示例 3：API 响应

```javascript
// ❌ 错误：未检查响应数据
fetch('/api/user')
  .then(res => res.data.user.name)  // data 或 user 可能不存在

// ✅ 正确：使用可选链
fetch('/api/user')
  .then(res => res?.data?.user?.name || '未知用户')
```

---

## 防护策略

### 可选链操作符 `?.`

可选链操作符允许安全地访问嵌套对象属性，即使中间某个引用为 null 或 undefined。

```javascript
// ✅ 对象属性访问
const email = user?.profile?.email

// ✅ 数组元素访问
const firstName = users?.[0]?.name

// ✅ 函数调用
const result = obj?.method?.()

// ✅ 组合使用
const value = data?.items?.[0]?.getValue?.()
```

### 空值合并操作符 `??`

空值合并操作符只在左侧为 null 或 undefined 时返回右侧值。

```javascript
// ✅ 提供默认值
const name = user?.name ?? '匿名用户'
const count = data?.count ?? 0

// ⚠️ 注意：与 || 的区别
const value1 = 0 || 100    // 100（0 被视为 falsy）
const value2 = 0 ?? 100    // 0（只有 null/undefined 才用默认值）

const value3 = '' || '默认'  // '默认'
const value4 = '' ?? '默认'  // ''
```

### 提前检查

在访问前先检查对象/数组/函数是否存在。

```javascript
// ✅ if 检查
if (user && user.profile) {
  console.log(user.profile.email)
}

// ✅ 三元运算符
const email = user && user.profile ? user.profile.email : null

// ✅ 逻辑与运算符
user && user.profile && console.log(user.profile.email)
```

### 默认值处理

为可能为空的变量提供默认值。

```javascript
// ✅ 函数参数默认值
function greet(name = '访客') {
  console.log(`你好，${name}`)
}

// ✅ 解构赋值默认值
const { name = '未知', age = 0 } = user || {}

// ✅ 对象展开默认值
const config = {
  timeout: 5000,
  retries: 3,
  ...userConfig
}
```

---

## 具体规范

### 1. 属性访问

**规则名称**：`null-safety/unsafe-property-access`

**规则说明**：访问嵌套对象属性时必须使用可选链或添加空值检查。

#### ✅ 推荐写法

```javascript
// ✅ 使用可选链
const street = user?.address?.street
const company = user?.job?.company?.name

// ✅ 使用空值检查
let email
if (user && user.profile && user.profile.email) {
  email = user.profile.email
}

// ✅ 使用逻辑运算符
const phone = user && user.contact && user.contact.phone

// ✅ 提供默认值
const username = user?.profile?.username ?? '匿名用户'
```

#### ❌ 错误写法

```javascript
// ❌ 直接访问嵌套属性（危险）
const street = user.address.street
const company = user.job.company.name
const email = user.profile.email

// ❌ 只检查第一层
if (user) {
  const street = user.address.street  // address 可能为 undefined
}
```

---

### 2. 数组访问

**规则名称**：`null-safety/unsafe-array-access`

**规则说明**：访问数组元素前应检查数组长度或使用可选链。

#### ✅ 推荐写法

```javascript
// ✅ 使用可选链
const firstUser = users?.[0]
const firstEmail = users?.[0]?.email

// ✅ 检查长度
if (users && users.length > 0) {
  const firstUser = users[0]
  console.log(firstUser.name)
}

// ✅ 使用 Array 方法（自带保护）
const firstUser = users?.find(u => u.id === 1)
const emails = users?.map(u => u.email) || []

// ✅ 提供默认值
const firstUser = users?.[0] ?? { name: '默认用户' }
```

#### ❌ 错误写法

```javascript
// ❌ 不检查就访问
const firstUser = users[0]  // users 可能为空数组
const email = users[0].email

// ❌ 不检查数组存在性
const length = users.length  // users 可能为 undefined
const item = users[index]
```

---

### 3. 函数调用

**规则名称**：`null-safety/unsafe-function-call`

**规则说明**：调用对象方法前应检查方法是否存在。

#### ✅ 推荐写法

```javascript
// ✅ 使用可选链调用
const result = obj?.method?.()
const value = data?.getValue?.()

// ✅ 检查函数类型
if (typeof callback === 'function') {
  callback(data)
}

// ✅ 检查对象和方法
if (user && typeof user.getName === 'function') {
  const name = user.getName()
}

// ✅ 提供默认函数
const callback = options?.onSuccess || (() => {})
callback(result)
```

#### ❌ 错误写法

```javascript
// ❌ 直接调用（危险）
const result = obj.method()  // obj 或 method 可能不存在
const value = data.getValue()

// ❌ 不检查函数类型
callback(data)  // callback 可能不是函数
user.getName()  // getName 可能不存在
```

---

### 4. API 响应处理

**规则名称**：`null-safety/unsafe-api-response`

**规则说明**：处理 API 响应前应检查数据存在性。

#### ✅ 推荐写法

```javascript
// ✅ 使用可选链和默认值
fetch('/api/user')
  .then(res => res.json())
  .then(data => {
    const username = data?.user?.name ?? '未知用户'
    const email = data?.user?.email ?? '无邮箱'
    console.log(username, email)
  })
  .catch(error => {
    console.error('请求失败', error)
  })

// ✅ 检查数据结构
async function fetchUserData() {
  try {
    const response = await fetch('/api/user')
    const data = await response.json()
    
    if (data && data.user) {
      return data.user
    }
    
    throw new Error('数据格式错误')
  } catch (error) {
    console.error('获取用户数据失败', error)
    return null
  }
}

// ✅ 使用类型守卫（TypeScript）
interface ApiResponse {
  success: boolean
  data?: {
    user?: {
      name: string
      email: string
    }
  }
}

function processResponse(res: ApiResponse) {
  if (res.success && res.data?.user) {
    console.log(res.data.user.name)
  }
}
```

#### ❌ 错误写法

```javascript
// ❌ 直接访问响应数据
fetch('/api/user')
  .then(res => res.json())
  .then(data => {
    console.log(data.user.name)  // data 或 user 可能不存在
    const email = data.user.email
  })

// ❌ 不处理错误情况
async function fetchUserData() {
  const response = await fetch('/api/user')
  const data = await response.json()
  return data.user.name  // 多处可能为空
}
```

---

### 5. DOM 元素操作

**规则名称**：`null-safety/unsafe-dom-access`

**规则说明**：操作 DOM 元素前应检查元素是否存在。

#### ✅ 推荐写法

```javascript
// ✅ 检查元素存在性
const button = document.querySelector('#submit-btn')
if (button) {
  button.addEventListener('click', handleClick)
  button.disabled = true
}

// ✅ 使用可选链
document.querySelector('#my-element')?.classList.add('active')

// ✅ 批量操作时使用 querySelectorAll
const buttons = document.querySelectorAll('.btn')
buttons.forEach(btn => {
  btn.addEventListener('click', handleClick)
})

// ✅ 保存元素引用并检查
class MyComponent {
  constructor() {
    this.container = document.querySelector('#container')
    if (!this.container) {
      throw new Error('容器元素不存在')
    }
  }
  
  render() {
    this.container.innerHTML = '<div>内容</div>'
  }
}
```

#### ❌ 错误写法

```javascript
// ❌ 不检查就操作
const button = document.querySelector('#submit-btn')
button.addEventListener('click', handleClick)  // button 可能为 null
button.disabled = true

// ❌ 链式调用不检查
document.querySelector('#my-element').classList.add('active')

// ❌ 直接访问属性
const value = document.getElementById('input').value
```

---

### 6. 解构赋值

**规则名称**：`null-safety/unsafe-destructuring`

**规则说明**：解构可能为空的对象时应提供默认值。

#### ✅ 推荐写法

```javascript
// ✅ 提供对象默认值
const { name, age } = user || {}

// ✅ 提供属性默认值
const { name = '未知', age = 0 } = user || {}

// ✅ 嵌套解构提供默认值
const { 
  profile: { 
    email = 'no-email@example.com' 
  } = {} 
} = user || {}

// ✅ 数组解构提供默认值
const [first = {}, second = {}] = items || []

// ✅ 函数参数解构
function greetUser({ name = '访客', role = 'user' } = {}) {
  console.log(`你好，${name}（${role}）`)
}
```

#### ❌ 错误写法

```javascript
// ❌ 不提供默认值
const { name, age } = user  // user 可能为 undefined

// ❌ 嵌套解构不安全
const { profile: { email } } = user  // profile 可能不存在

// ❌ 数组解构不安全
const [first, second] = items  // items 可能为 undefined
```

---

### 7. Vue Props 访问

**规则名称**：`null-safety/vue-props-access`

**规则说明**：访问 Vue props 属性前应检查存在性或设置 required。

#### ✅ 推荐写法

```vue
<script>
export default {
  props: {
    // ✅ 设置 required: true
    user: {
      type: Object,
      required: true
    },
    
    // ✅ 提供默认值
    config: {
      type: Object,
      default: () => ({
        timeout: 5000
      })
    },
    
    // ✅ 数组提供默认值
    items: {
      type: Array,
      default: () => []
    }
  },
  
  computed: {
    userName() {
      // ✅ 使用可选链
      return this.user?.name ?? '未知用户'
    },
    
    itemCount() {
      // ✅ 数组安全访问
      return this.items?.length ?? 0
    }
  },
  
  methods: {
    getUserEmail() {
      // ✅ 检查后访问
      if (this.user && this.user.profile) {
        return this.user.profile.email
      }
      return null
    }
  }
}
</script>
```

#### ❌ 错误写法

```vue
<script>
export default {
  props: {
    // ❌ 既不是 required，也没默认值
    user: {
      type: Object
    }
  },
  
  computed: {
    userName() {
      // ❌ 直接访问（危险）
      return this.user.name
    }
  },
  
  methods: {
    getUserEmail() {
      // ❌ 不检查就访问嵌套属性
      return this.user.profile.email
    }
  }
}
</script>
```

---

## 📊 检查规则总结

| 规则名称 | 级别 | 说明 |
|---------|------|------|
| `null-safety/unsafe-property-access` | P0 (error) | 不安全的属性访问 |
| `null-safety/unsafe-array-access` | P0 (error) | 不安全的数组访问 |
| `null-safety/unsafe-function-call` | P1 (warning) | 不安全的函数调用 |
| `null-safety/prefer-null-check` | P1 (warning) | 建议使用 == null 检查 |
| `null-safety/unsafe-api-response` | P0 (error) | 不安全的 API 响应处理 |
| `null-safety/unsafe-dom-access` | P0 (error) | 不安全的 DOM 操作 |
| `null-safety/unsafe-destructuring` | P1 (warning) | 不安全的解构赋值 |
| `null-safety/vue-props-access` | P0 (error) | Vue Props 不安全访问 |

---

## 🛠️ 推荐实现方案 (Implementation)

为了方便开发者快速落地上述规范，我们提供了 `@51jbs/core-utils` 工具库，内置了符合规范的工具函数。

### 1. 使用 `safeGet` 进行深层访问

**库地址**：`@51jbs/core-utils/object`

```javascript
import { safeGet } from '@51jbs/core-utils'

// ✅ 自动处理 null/undefined，支持路径字符串和默认值
const street = safeGet(user, 'address.street', '未知街道')
const firstTag = safeGet(data, 'tags[0].name')
```

### 2. 使用 `safeFormat` 处理空值显示

**库地址**：`@51jbs/core-utils/format`

该系列函数自动将 `null`、`undefined` 或空字符串转换为规范要求的默认占位符 `-`。

```javascript
import { formatPhone, formatCurrency, safeFormat } from '@51jbs/core-utils'

// ✅ 如果 phone 为空，返回 '-'
const displayPhone = formatPhone(user?.phone) 

// ✅ 自定义格式化
const displayValue = safeFormat(value, (v) => `${v}%`, '0%')
```

---

## 🔧 配置示例

在 `webpack.config.js` 中启用空指针防护检查：

```javascript
const SpecPlugin = require('@51jbs/spec-plugin')

module.exports = {
  plugins: [
    new SpecPlugin({
      rules: {
        nullSafety: true  // 启用空指针防护检查
      }
    })
  ]
}
```

---

## 💡 最佳实践总结

### 1. 优先使用可选链

```javascript
// ✅ 推荐
const value = obj?.prop?.subProp

// ⚠️ 繁琐
const value = obj && obj.prop && obj.prop.subProp
```

### 2. 合理使用空值合并

```javascript
// ✅ 推荐：只在 null/undefined 时使用默认值
const count = data?.count ?? 0

// ⚠️ 可能不符合预期：0 也会被替换
const count = data?.count || 0
```

### 3. API 响应必须检查

```javascript
// ✅ 总是检查 API 响应
fetch('/api/data')
  .then(res => res.json())
  .then(data => {
    if (data?.success && data?.result) {
      handleData(data.result)
    }
  })
  .catch(handleError)
```

### 4. 提供合理的默认值

```javascript
// ✅ 函数参数默认值
function process(options = {}) {
  const { timeout = 5000, retries = 3 } = options
}

// ✅ Props 默认值
props: {
  items: {
    type: Array,
    default: () => []
  }
}
```

### 5. TypeScript 类型保护

```typescript
// ✅ 使用类型守卫
function isValidUser(user: any): user is User {
  return user && typeof user.name === 'string'
}

if (isValidUser(data)) {
  console.log(data.name)  // 安全
}
```

### 存量代码治理 (Baseline 机制)

针对存量项目，如果一次性修复所有警告风险过高，可使用“基线机制”实现新老划断：

1.  **生成基线**：运行一次全量检查并生成快照。
    ```javascript
    new SpecPlugin({ generateBaseline: true })
    ```
2.  **开启治理**：后续构建将自动忽略基线中的存量问题，只对新增代码报错。
    ```javascript
    new SpecPlugin({ useBaseline: true, baselineFile: '.spec-baseline.json' })
    ```

---

## 📚 参考资料

- [MDN - 可选链操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [MDN - 空值合并操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing)
- [TypeScript 严格空值检查](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

---

**最后更新**：2025-12-21
