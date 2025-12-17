# 边界处理规范

> 完善的边界处理是保证代码健壮性的关键

**规范目的**：避免因边界条件处理不当导致的运行时错误、数据异常和性能问题。

**适用范围**：所有 JavaScript/TypeScript/Vue 代码

---

## 📋 目录

- [为什么需要边界处理](#为什么需要边界处理)
- [常见边界问题](#常见边界问题)
- [边界处理原则](#边界处理原则)
- [详细规范](#详细规范)

---

## 为什么需要边界处理

### 问题场景

```javascript
// ❌ 没有边界处理的代码
function getTopUsers(users) {
  return users.slice(0, 10)  // users 可能为 null/undefined
}

function divide(a, b) {
  return a / b  // b 可能为 0
}

for (let i = 0; i <= arr.length; i++) {  // 越界访问
  console.log(arr[i])
}
```

### 可能的后果

- 💥 **运行时崩溃** - 应用直接报错
- 🐛 **数据异常** - 产生 NaN、Infinity 等异常值
- 🔄 **无限循环** - 导致页面卡死
- 📉 **性能下降** - 一次加载过多数据
- 🚨 **栈溢出** - 递归无终止条件

---

## 常见边界问题

### 1. 数组边界

```javascript
// ❌ 错误：未检查数组长度
const first = arr[0]
const last = arr[arr.length]  // 越界！应该是 arr.length - 1

// ✅ 正确
const first = arr?.[0]
const last = arr?.[arr.length - 1]
```

### 2. 除零错误

```javascript
// ❌ 错误：未检查除数
const average = total / count

// ✅ 正确
const average = count > 0 ? total / count : 0
```

### 3. 循环边界

```javascript
// ❌ 错误：使用 <= 遍历数组
for (let i = 0; i <= arr.length; i++) {
  console.log(arr[i])  // 最后一次会越界
}

// ✅ 正确
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i])
}
```

### 4. 字符串索引

```javascript
// ❌ 错误：未检查字符串长度
const char = str.charAt(index)

// ✅ 正确
const char = index >= 0 && index < str.length ? str.charAt(index) : ''
```

### 5. 递归深度

```javascript
// ❌ 错误：无终止条件
function factorial(n) {
  return n * factorial(n - 1)  // 栈溢出！
}

// ✅ 正确
function factorial(n) {
  if (n <= 1) return 1  // 基准情况
  return n * factorial(n - 1)
}
```

---

## 边界处理原则

### 1. 防御性编程

**总是假设输入可能异常**

```javascript
// ❌ 错误：假设数据总是正常的
function processUser(user) {
  return user.profile.email.toLowerCase()
}

// ✅ 正确：防御性编程
function processUser(user) {
  if (!user || !user.profile || !user.profile.email) {
    return ''
  }
  return user.profile.email.toLowerCase()
}

// ✅ 更好：使用可选链
function processUser(user) {
  return user?.profile?.email?.toLowerCase() ?? ''
}
```

### 2. 早返回原则

**先处理边界情况，再处理正常逻辑**

```javascript
// ❌ 错误：嵌套过深
function getData(arr) {
  if (arr && arr.length > 0) {
    const filtered = arr.filter(item => item.active)
    if (filtered.length > 0) {
      return filtered.map(item => item.value)
    }
  }
  return []
}

// ✅ 正确：早返回
function getData(arr) {
  if (!arr || arr.length === 0) return []
  
  const filtered = arr.filter(item => item.active)
  if (filtered.length === 0) return []
  
  return filtered.map(item => item.value)
}
```

### 3. 合理的默认值

**为边界情况提供合理的默认值**

```javascript
// ❌ 错误：返回 undefined
function getPageSize(config) {
  return config.pageSize
}

// ✅ 正确：提供默认值
function getPageSize(config) {
  return config?.pageSize ?? 20
}

// ✅ 更好：限制范围
function getPageSize(config) {
  const size = config?.pageSize ?? 20
  return Math.min(Math.max(size, 10), 100)  // 限制在 10-100 之间
}
```

---

## 详细规范

### 1. 数组操作边界 (boundary/array-slice)

**规则**：数组切片、拼接等操作前应检查数组长度

**严重程度**：⚠️ 警告

#### 错误示例

```javascript
// ❌ 错误：直接切片
const top10 = users.slice(0, 10)
const removed = arr.splice(5, 3)

// ❌ 错误：未检查索引
function removeAt(arr, index) {
  arr.splice(index, 1)
}
```

#### 正确示例

```javascript
// ✅ 正确：检查长度
const top10 = users && users.length > 0 ? users.slice(0, 10) : []

// ✅ 正确：使用可选链
const top10 = users?.slice(0, 10) ?? []

// ✅ 正确：检查索引有效性
function removeAt(arr, index) {
  if (!arr || index < 0 || index >= arr.length) {
    return
  }
  arr.splice(index, 1)
}
```

---

### 2. 字符串索引访问 (boundary/string-index)

**规则**：字符串索引访问应检查索引范围

**严重程度**：⚠️ 警告

#### 错误示例

```javascript
// ❌ 错误：未检查索引
const char = str.charAt(index)
const code = str.charCodeAt(position)
```

#### 正确示例

```javascript
// ✅ 正确：检查索引
const char = index >= 0 && index < str.length ? str.charAt(index) : ''

// ✅ 正确：使用可选链（对于对象）
const char = str?.[index] ?? ''

// ✅ 正确：提供默认值
function getChar(str, index, defaultChar = '') {
  if (typeof str !== 'string' || index < 0 || index >= str.length) {
    return defaultChar
  }
  return str.charAt(index)
}
```

---

### 3. 除零检查 (boundary/division-zero)

**规则**：除法运算前必须检查除数是否为零

**严重程度**：🔴 错误

#### 错误示例

```javascript
// ❌ 错误：未检查除数
const average = sum / count
const rate = passed / total
const percent = (value / max) * 100
```

#### 正确示例

```javascript
// ✅ 正确：检查除数
const average = count > 0 ? sum / count : 0

// ✅ 正确：三元运算
const rate = total > 0 ? passed / total : 0

// ✅ 正确：提供有意义的默认值
const percent = max > 0 ? (value / max) * 100 : 0

// ✅ 最佳：封装函数
function safeDevide(dividend, divisor, defaultValue = 0) {
  return divisor !== 0 ? dividend / divisor : defaultValue
}

const average = safeDevide(sum, count)
```

---

### 4. NaN 检查 (boundary/parse-nan)

**规则**：parseInt/parseFloat 后应检查结果是否为 NaN

**严重程度**：⚠️ 警告

#### 错误示例

```javascript
// ❌ 错误：未检查 NaN
const age = parseInt(input)
const price = parseFloat(priceStr)
const count = Number(countStr)
```

#### 正确示例

```javascript
// ✅ 正确：检查 NaN
const age = parseInt(input)
if (isNaN(age)) {
  console.error('Invalid age')
  return
}

// ✅ 正确：提供默认值
const price = parseFloat(priceStr) || 0

// ✅ 最佳：封装函数
function parseIntSafe(str, defaultValue = 0) {
  const num = parseInt(str)
  return isNaN(num) ? defaultValue : num
}

const age = parseIntSafe(input, 18)
```

---

### 5. 循环边界检查 (boundary/loop-off-by-one)

**规则**：循环条件应避免 off-by-one 错误

**严重程度**：🔴 错误

#### 错误示例

```javascript
// ❌ 错误：使用 <= 遍历数组（越界）
for (let i = 0; i <= arr.length; i++) {
  console.log(arr[i])  // arr[arr.length] 是 undefined
}

// ❌ 错误：循环变量未递增
for (let i = 0; i < 100; ) {  // 无限循环！
  console.log(i)
}

// ❌ 错误：错误的递减条件
for (let i = 10; i < 0; i--) {  // 永远不会执行
  console.log(i)
}
```

#### 正确示例

```javascript
// ✅ 正确：使用 < 遍历数组
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i])
}

// ✅ 正确：确保循环变量递增
for (let i = 0; i < 100; i++) {
  console.log(i)
}

// ✅ 正确：递减循环
for (let i = 10; i > 0; i--) {
  console.log(i)
}

// ✅ 最佳：使用 forEach/map 避免手动索引
arr.forEach(item => console.log(item))
```

---

### 6. while 循环退出条件 (boundary/while-no-exit)

**规则**：while 循环必须有明确的退出条件

**严重程度**：⚠️ 警告

#### 错误示例

```javascript
// ❌ 错误：无退出条件
while (true) {
  processData()  // 无限循环！
}

// ❌ 错误：条件永远为真
let flag = true
while (flag) {
  doSomething()  // flag 从未改变
}
```

#### 正确示例

```javascript
// ✅ 正确：有 break 退出
while (true) {
  const data = getNextData()
  if (!data) break  // 明确的退出条件
  processData(data)
}

// ✅ 正确：有计数器限制
let attempts = 0
while (attempts < MAX_ATTEMPTS) {
  if (tryConnect()) break
  attempts++
}

// ✅ 正确：条件会改变
let hasMore = true
while (hasMore) {
  hasMore = processNextPage()
}
```

---

### 7. 递归终止条件 (boundary/recursion-no-base)

**规则**：递归函数必须有明确的终止条件（基准情况）

**严重程度**：🔴 错误

#### 错误示例

```javascript
// ❌ 错误：无终止条件（栈溢出）
function factorial(n) {
  return n * factorial(n - 1)
}

// ❌ 错误：终止条件错误
function countdown(n) {
  console.log(n)
  countdown(n - 1)  // 会变成负数，继续递归
}
```

#### 正确示例

```javascript
// ✅ 正确：有基准情况
function factorial(n) {
  if (n <= 1) return 1  // 终止条件
  return n * factorial(n - 1)
}

// ✅ 正确：多个终止条件
function fibonacci(n) {
  if (n <= 0) return 0  // 终止条件 1
  if (n === 1) return 1  // 终止条件 2
  return fibonacci(n - 1) + fibonacci(n - 2)
}

// ✅ 最佳：添加深度限制
function traverse(node, depth = 0, maxDepth = 100) {
  if (!node || depth > maxDepth) return  // 防止无限递归
  
  processNode(node)
  
  if (node.children) {
    node.children.forEach(child => traverse(child, depth + 1, maxDepth))
  }
}
```

---

### 8. 大索引访问 (boundary/large-index)

**规则**：访问较大索引前应检查数组长度

**严重程度**：⚠️ 警告

#### 错误示例

```javascript
// ❌ 错误：访问固定大索引
const value = arr[100]
const item = list[999]
```

#### 正确示例

```javascript
// ✅ 正确：检查长度
const value = arr.length > 100 ? arr[100] : undefined

// ✅ 正确：使用可选链
const value = arr?.[100]

// ✅ 最佳：提供默认值
const value = arr?.[100] ?? defaultValue
```

---

### 9. 分页边界检查 (boundary/pagination-max)

**规则**：分页参数应检查是否超过最大页数

**严重程度**：⚠️ 警告

#### 错误示例

```javascript
// ❌ 错误：未限制页码
function loadPage(page) {
  fetchData({ page })  // 可能请求不存在的页面
}

// ❌ 错误：未限制 pageSize
function loadData(pageSize) {
  fetchData({ pageSize })  // 可能一次加载过多数据
}
```

#### 正确示例

```javascript
// ✅ 正确：检查页码范围
function loadPage(page, totalPages) {
  if (page < 1) page = 1
  if (page > totalPages) page = totalPages
  
  fetchData({ page })
}

// ✅ 正确：限制 pageSize
function loadData(pageSize) {
  const size = Math.min(Math.max(pageSize, 10), 100)  // 10-100 之间
  fetchData({ pageSize: size })
}

// ✅ 最佳：完整的分页逻辑
function fetchPage(page, pageSize, total) {
  // 限制 pageSize
  const size = Math.min(Math.max(pageSize, 10), 100)
  
  // 计算总页数
  const totalPages = Math.ceil(total / size)
  
  // 限制页码
  const currentPage = Math.min(Math.max(page, 1), totalPages || 1)
  
  return fetchData({ 
    page: currentPage, 
    pageSize: size 
  })
}
```

---

### 10. 输入验证 (boundary/input-validation)

**规则**：用户输入应进行验证（非空、长度、格式等）

**严重程度**：⚠️ 警告

#### 错误示例

```javascript
// ❌ 错误：直接使用用户输入
function saveUser(name) {
  db.insert({ name })  // name 可能为空或过长
}

// ❌ 错误：未验证格式
function sendEmail(email) {
  smtp.send(email)  // email 格式可能错误
}
```

#### 正确示例

```javascript
// ✅ 正确：验证非空
function saveUser(name) {
  if (!name || !name.trim()) {
    throw new Error('姓名不能为空')
  }
  db.insert({ name: name.trim() })
}

// ✅ 正确：验证长度
function saveUser(name) {
  const trimmed = (name || '').trim()
  
  if (trimmed.length === 0) {
    throw new Error('姓名不能为空')
  }
  
  if (trimmed.length > 50) {
    throw new Error('姓名长度不能超过50个字符')
  }
  
  db.insert({ name: trimmed })
}

// ✅ 正确：验证格式
function sendEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email || !emailRegex.test(email)) {
    throw new Error('邮箱格式错误')
  }
  
  smtp.send(email)
}

// ✅ 最佳：封装验证函数
function validateInput(value, rules) {
  const { required, minLength, maxLength, pattern } = rules
  
  // 必填检查
  if (required && !value) {
    return { valid: false, error: '此字段为必填项' }
  }
  
  if (!value) return { valid: true }
  
  // 长度检查
  if (minLength && value.length < minLength) {
    return { valid: false, error: `长度不能少于${minLength}个字符` }
  }
  
  if (maxLength && value.length > maxLength) {
    return { valid: false, error: `长度不能超过${maxLength}个字符` }
  }
  
  // 格式检查
  if (pattern && !pattern.test(value)) {
    return { valid: false, error: '格式错误' }
  }
  
  return { valid: true }
}
```

---

### 11. 日期有效性检查 (boundary/date-invalid)

**规则**：创建 Date 对象后应检查日期是否有效

**严重程度**：⚠️ 警告

#### 错误示例

```javascript
// ❌ 错误：未检查日期有效性
const date = new Date(userInput)
const timestamp = date.getTime()  // 可能是 NaN

// ❌ 错误：未处理无效日期
function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString()  // 可能是 "Invalid Date"
}
```

#### 正确示例

```javascript
// ✅ 正确：检查日期有效性
const date = new Date(userInput)
if (isNaN(date.getTime())) {
  console.error('无效的日期')
  return
}

// ✅ 正确：提供默认值
function formatDate(dateStr) {
  const date = new Date(dateStr)
  
  if (isNaN(date.getTime())) {
    return '无效日期'
  }
  
  return date.toLocaleDateString()
}

// ✅ 最佳：封装日期处理
function parseDate(input, defaultValue = null) {
  if (!input) return defaultValue
  
  const date = new Date(input)
  
  if (isNaN(date.getTime())) {
    return defaultValue
  }
  
  return date
}

const validDate = parseDate(userInput, new Date())
```

---

## 🎯 最佳实践

### 1. 使用现代语法

```javascript
// ✅ 可选链
const email = user?.profile?.email

// ✅ 空值合并
const name = user?.name ?? 'Guest'

// ✅ 可选链调用
const result = obj?.method?.()

// ✅ 数组可选链
const first = arr?.[0]
```

### 2. 封装边界检查

```javascript
// ✅ 封装数组安全访问
function safeGet(arr, index, defaultValue = undefined) {
  return arr && index >= 0 && index < arr.length 
    ? arr[index] 
    : defaultValue
}

// ✅ 封装范围限制
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

const pageSize = clamp(userInput, 10, 100)
```

### 3. 使用类型检查

```javascript
// ✅ TypeScript 类型守卫
function isValidArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0
}

if (isValidArray(data)) {
  // data 类型现在是 T[]
  const first = data[0]
}
```

### 4. 统一错误处理

```javascript
// ✅ 统一的边界错误处理
class BoundaryError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BoundaryError'
  }
}

function processArray(arr: number[], index: number) {
  if (!arr || !Array.isArray(arr)) {
    throw new BoundaryError('数组参数无效')
  }
  
  if (index < 0 || index >= arr.length) {
    throw new BoundaryError(`索引 ${index} 超出范围 [0, ${arr.length - 1}]`)
  }
  
  return arr[index]
}
```

---

## 📚 相关资源

- [空指针防护规范](./null-safety-specification.md)
- [JavaScript 开发规范](../coding/javascript.md)
- [防御性编程](https://zh.wikipedia.org/wiki/防御性编程)

---

**最后更新**：2025-12-15  
**规则数量**：11 项  
**维护者**：前端效率平台团队
