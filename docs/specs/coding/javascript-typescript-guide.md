# JavaScript/TypeScript 开发规范详细指南（面向初级开发者）

> 本指南涵盖 ES6+ 和 TypeScript，适用于 Vue 2 项目开发。

## 📚 目录

- [变量声明](#变量声明)
- [数据类型](#数据类型)
- [函数](#函数)
- [对象和数组](#对象和数组)
- [异步编程](#异步编程)
- [类和继承](#类和继承)
- [模块化](#模块化)
- [TypeScript 基础](#typescript-基础)
- [错误处理](#错误处理)
- [性能优化](#性能优化)

---

## 变量声明

### 1. 使用 const 和 let，禁止 var

```javascript
// ✅ 推荐：使用 const（不会重新赋值）
const userName = 'Zhang San'
const userAge = 25
const isActive = true

// ✅ 推荐：使用 let（需要重新赋值）
let count = 0
count = count + 1

let status = 'pending'
status = 'completed'

// ❌ 禁止：使用 var
var oldStyle = 'deprecated'  // 不要使用 var！
```

**为什么禁止 var？**

| 特性 | var | let/const |
|------|-----|-----------|
| 作用域 | 函数作用域 | 块作用域 |
| 变量提升 | 有（会导致混乱） | 无 |
| 重复声明 | 允许（易出错） | 不允许 |
| 临时死区 | 无 | 有（更安全） |

**var 的问题示例**：

```javascript
// ❌ var 的函数作用域问题
function example() {
  if (true) {
    var x = 1  // x 的作用域是整个函数
  }
  console.log(x)  // 1（可以访问，容易出错）
}

// ✅ let 的块作用域
function betterExample() {
  if (true) {
    let x = 1  // x 的作用域是 if 块内
  }
  console.log(x)  // ReferenceError（更安全）
}

// ❌ var 的循环问题
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出：3, 3, 3（所有回调共享同一个 i）

// ✅ let 解决循环问题
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出：0, 1, 2（每次迭代都有独立的 i）
```

### 2. const vs let 的选择

```javascript
// ✅ 推荐：默认使用 const
const API_URL = 'https://api.example.com'
const MAX_RETRY = 3
const userData = { name: 'Alice', age: 25 }

// ⚠️ 注意：const 只保证引用不变，不保证值不变
const user = { name: 'Alice' }
user.name = 'Bob'  // ✅ 可以修改对象属性
user.age = 25      // ✅ 可以添加新属性
// user = {}       // ❌ 不能重新赋值

const list = [1, 2, 3]
list.push(4)       // ✅ 可以修改数组
// list = []       // ❌ 不能重新赋值

// ✅ 使用 let：需要重新赋值的变量
let count = 0
count++

let status = 'idle'
status = 'loading'
status = 'success'
```

**选择规则**：
1. **默认使用 const**：90% 的情况
2. **需要重新赋值时使用 let**：计数器、状态标志等
3. **永远不要使用 var**

### 3. 变量命名规范

```javascript
// ✅ 推荐：camelCase 命名变量和函数
const userName = 'Alice'
const userAge = 25
const isActive = true
const hasPermission = false

function getUserData() {}
function calculateTotal() {}

// ✅ 推荐：UPPER_SNAKE_CASE 命名常量
const MAX_COUNT = 100
const API_URL = 'https://api.example.com'
const DEFAULT_TIMEOUT = 3000

// ✅ 推荐：PascalCase 命名类和构造函数
class UserService {}
class DataManager {}

// ✅ 推荐：布尔值用 is/has/should/can 前缀
const isLoading = false
const hasError = false
const shouldUpdate = true
const canEdit = false

// ❌ 错误：命名不规范
const user_name = 'Alice'     // 不要用 snake_case
const UserAge = 25            // 不要用 PascalCase
const MAX_count = 100         // 不要混用大小写
const getdata = () => {}      // 缺少分隔
const x = 'Alice'             // 命名太短，没意义
const thisIsAReallyLongVariableNameThatIsHardToRead = 1  // 太长
```

**命名最佳实践**：
- 变量名要有意义，看名字就知道用途
- 布尔值用 is/has/should/can 开头
- 常量用全大写 + 下划线
- 避免单字母变量（除了循环中的 i、j）
- 避免缩写，除非是通用缩写（如 URL、ID）

---

## 数据类型

### 1. 字符串

```javascript
// ✅ 推荐：使用模板字符串
const name = 'Alice'
const age = 25

const message = `Hello, ${name}! You are ${age} years old.`
const html = `
  <div class="user">
    <h3>${name}</h3>
    <p>Age: ${age}</p>
  </div>
`

// ✅ 推荐：模板字符串支持表达式
const result = `2 + 2 = ${2 + 2}`
const status = `Status: ${isActive ? 'Active' : 'Inactive'}`
const url = `https://api.example.com/users/${userId}/posts`

// ❌ 禁止：使用字符串拼接
const badMessage = 'Hello, ' + name + '! You are ' + age + ' years old.'
const badUrl = 'https://api.example.com/users/' + userId + '/posts'

// ✅ 推荐：字符串方法
const str = 'Hello World'
str.toUpperCase()        // 'HELLO WORLD'
str.toLowerCase()        // 'hello world'
str.includes('World')    // true
str.startsWith('Hello')  // true
str.endsWith('World')    // true
str.trim()              // 去除两端空格
str.split(' ')          // ['Hello', 'World']

// ✅ 推荐：字符串截取
const text = 'JavaScript'
text.slice(0, 4)        // 'Java'
text.substring(4)       // 'Script'
text.substr(4, 6)       // 'Script'（已废弃，不推荐）
```

### 2. 数字

```javascript
// ✅ 推荐：数字字面量
const integer = 123
const float = 123.45
const binary = 0b1010      // 二进制：10
const octal = 0o12         // 八进制：10
const hex = 0xFF           // 十六进制：255
const scientific = 1e6     // 科学计数法：1000000

// ✅ 推荐：数字分隔符（ES2021）
const million = 1_000_000
const billion = 1_000_000_000

// ✅ 推荐：数字方法
Number.isInteger(123)      // true
Number.isNaN(NaN)          // true
Number.parseFloat('123.45') // 123.45
Number.parseInt('123', 10)  // 123

// ✅ 推荐：Math 对象
Math.round(4.5)    // 5（四舍五入）
Math.ceil(4.1)     // 5（向上取整）
Math.floor(4.9)    // 4（向下取整）
Math.max(1, 2, 3)  // 3
Math.min(1, 2, 3)  // 1
Math.random()      // 0-1 的随机数

// ⚠️ 注意：浮点数精度问题
0.1 + 0.2 === 0.3  // false！（IEEE 754 标准问题）
0.1 + 0.2          // 0.30000000000000004

// ✅ 推荐：处理浮点数
function addFloats(a, b) {
  return parseFloat((a + b).toFixed(2))
}
addFloats(0.1, 0.2)  // 0.3
```

### 3. 布尔值和类型转换

```javascript
// ✅ 推荐：布尔值
const isActive = true
const hasError = false

// ✅ 推荐：显式类型转换
Boolean(1)          // true
Boolean(0)          // false
Boolean('')         // false
Boolean('hello')    // true
Boolean(null)       // false
Boolean(undefined)  // false
Boolean({})         // true
Boolean([])         // true

// ⚠️ 注意：假值（falsy）只有 6 个
false
0
''（空字符串）
null
undefined
NaN

// ✅ 推荐：使用严格相等
1 === 1        // true
1 === '1'      // false（严格相等）
1 == '1'       // true（会类型转换，不推荐）

null === undefined   // false
null == undefined    // true（不推荐）

// ❌ 禁止：使用 == 进行比较
if (x == y) {}       // ❌ 可能导致意外的类型转换
if (x === y) {}      // ✅ 推荐

// ✅ 推荐：检查变量是否有值
if (value) {}                    // 检查是否为真值
if (value !== null && value !== undefined) {}  // 严格检查
if (value != null) {}            // 同时检查 null 和 undefined
```

---

## 函数

### 1. 函数声明 vs 函数表达式 vs 箭头函数

```javascript
// ✅ 推荐：函数声明（会提升）
function add(a, b) {
  return a + b
}

// ✅ 推荐：函数表达式
const multiply = function(a, b) {
  return a * b
}

// ✅ 推荐：箭头函数（简洁语法）
const subtract = (a, b) => a - b

// ✅ 推荐：箭头函数（多行）
const divide = (a, b) => {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}

// ✅ 推荐：单个参数可省略括号
const square = x => x * x

// ✅ 推荐：无参数使用空括号
const getRandom = () => Math.random()

// ❌ 错误：匿名函数（难以调试）
setTimeout(function() {
  console.log('timeout')
}, 1000)

// ✅ 推荐：命名函数
setTimeout(function handleTimeout() {
  console.log('timeout')
}, 1000)

// ✅ 更好：箭头函数
setTimeout(() => {
  console.log('timeout')
}, 1000)
```

**箭头函数 vs 普通函数**：

```javascript
// 区别 1：this 绑定
const obj = {
  name: 'Alice',
  
  // ❌ 箭头函数：this 是词法作用域
  sayHi: () => {
    console.log(`Hi, I'm ${this.name}`)  // undefined
  },
  
  // ✅ 普通函数：this 指向 obj
  sayHello() {
    console.log(`Hello, I'm ${this.name}`)  // 'Hello, I'm Alice'
  },
  
  // ✅ 箭头函数适用场景：回调函数
  delayedGreeting() {
    setTimeout(() => {
      console.log(`Hi, I'm ${this.name}`)  // 'Hi, I'm Alice'
    }, 1000)
  }
}

// 区别 2：arguments 对象
function normalFunc() {
  console.log(arguments)  // ✅ 有 arguments 对象
}

const arrowFunc = () => {
  console.log(arguments)  // ❌ ReferenceError
}

// ✅ 箭头函数使用剩余参数
const betterArrowFunc = (...args) => {
  console.log(args)  // ✅ 数组
}

// 区别 3：不能用作构造函数
function Person(name) {
  this.name = name
}
const person = new Person('Alice')  // ✅ 可以

const ArrowPerson = (name) => {
  this.name = name
}
// const badPerson = new ArrowPerson('Bob')  // ❌ TypeError
```

**使用建议**：
- 普通方法：使用普通函数或方法简写
- 回调函数：使用箭头函数
- 需要 this 绑定：使用普通函数
- 简单的工具函数：使用箭头函数

### 2. 参数处理

```javascript
// ✅ 推荐：默认参数
function createUser(name = 'Anonymous', age = 0, role = 'user') {
  return { name, age, role }
}

createUser()                          // { name: 'Anonymous', age: 0, role: 'user' }
createUser('Alice')                   // { name: 'Alice', age: 0, role: 'user' }
createUser('Bob', 25)                 // { name: 'Bob', age: 25, role: 'user' }
createUser('Charlie', 30, 'admin')    // { name: 'Charlie', age: 30, role: 'admin' }

// ✅ 推荐：对象参数（命名参数）
function createUserWithOptions({ name, age = 0, role = 'user' } = {}) {
  return { name, age, role }
}

createUserWithOptions({ name: 'Alice', age: 25 })
createUserWithOptions({ name: 'Bob', role: 'admin' })  // 可以跳过 age

// ❌ 错误：参数过多
function badFunction(a, b, c, d, e, f, g) {}  // 难以记忆和使用

// ✅ 推荐：使用对象参数
function betterFunction(options) {
  const { a, b, c, d, e, f, g } = options
}

// ✅ 推荐：剩余参数
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0)
}

sum(1, 2, 3)          // 6
sum(1, 2, 3, 4, 5)    // 15

// ✅ 推荐：参数解构
function displayUser({ name, age, email }) {
  console.log(`Name: ${name}, Age: ${age}, Email: ${email}`)
}

displayUser({ name: 'Alice', age: 25, email: 'alice@example.com' })

// ✅ 推荐：参数解构 + 默认值
function configure({ 
  timeout = 3000, 
  retries = 3, 
  method = 'GET' 
} = {}) {
  return { timeout, retries, method }
}

configure()                           // { timeout: 3000, retries: 3, method: 'GET' }
configure({ timeout: 5000 })          // { timeout: 5000, retries: 3, method: 'GET' }
```

### 3. 返回值

```javascript
// ✅ 推荐：明确返回值
function add(a, b) {
  return a + b
}

// ✅ 推荐：提前返回（卫语句）
function processUser(user) {
  if (!user) {
    return null
  }
  
  if (!user.isActive) {
    return null
  }
  
  // 主要逻辑
  return {
    id: user.id,
    name: user.name
  }
}

// ❌ 错误：嵌套 if
function badProcessUser(user) {
  if (user) {
    if (user.isActive) {
      return {
        id: user.id,
        name: user.name
      }
    }
  }
  return null
}

// ✅ 推荐：返回对象（多个返回值）
function getUserInfo(userId) {
  return {
    success: true,
    data: { id: userId, name: 'Alice' },
    message: 'User found'
  }
}

// ✅ 推荐：解构返回值
const { success, data, message } = getUserInfo(1)
```

---

## 对象和数组

### 1. 对象操作

```javascript
// ✅ 推荐：对象字面量
const user = {
  name: 'Alice',
  age: 25,
  email: 'alice@example.com'
}

// ✅ 推荐：属性简写
const name = 'Bob'
const age = 30

const newUser = { name, age }  // { name: 'Bob', age: 30 }

// ✅ 推荐：方法简写
const obj = {
  // 旧写法
  sayHi: function() {
    console.log('Hi')
  },
  
  // ✅ 新写法（推荐）
  sayHello() {
    console.log('Hello')
  }
}

// ✅ 推荐：计算属性名
const key = 'dynamicKey'
const value = 'dynamicValue'

const dynamicObj = {
  [key]: value,               // dynamicKey: 'dynamicValue'
  [`${key}Suffix`]: 'test',   // dynamicKeySuffix: 'test'
  [`get${name}`]() {}         // 动态方法名
}

// ✅ 推荐：对象展开（复制和合并）
const original = { a: 1, b: 2 }
const copy = { ...original }              // 浅拷贝
const extended = { ...original, c: 3 }    // 添加属性
const updated = { ...original, a: 10 }    // 更新属性

// ✅ 推荐：合并多个对象
const obj1 = { a: 1, b: 2 }
const obj2 = { c: 3, d: 4 }
const obj3 = { e: 5 }
const merged = { ...obj1, ...obj2, ...obj3 }

// ✅ 推荐：对象解构
const user = { name: 'Alice', age: 25, email: 'alice@example.com' }
const { name, age } = user
const { name: userName, age: userAge } = user  // 重命名
const { name, ...rest } = user  // 剩余属性

// ✅ 推荐：嵌套解构
const data = {
  user: {
    name: 'Alice',
    address: {
      city: 'Beijing'
    }
  }
}
const { user: { name, address: { city } } } = data

// ✅ 推荐：对象方法
Object.keys(obj)        // 获取所有键
Object.values(obj)      // 获取所有值
Object.entries(obj)     // 获取键值对数组
Object.assign({}, obj)  // 合并对象（浅拷贝）

// ✅ 推荐：检查属性
'name' in user          // true（检查属性是否存在）
user.hasOwnProperty('name')  // true（检查自有属性）
```

### 2. 数组操作

```javascript
// ✅ 推荐：创建数组
const arr1 = [1, 2, 3]
const arr2 = new Array(5).fill(0)  // [0, 0, 0, 0, 0]
const arr3 = Array.from({ length: 5 }, (_, i) => i)  // [0, 1, 2, 3, 4]

// ✅ 推荐：数组展开
const original = [1, 2, 3]
const copy = [...original]               // 浅拷贝
const extended = [...original, 4, 5]     // 添加元素
const merged = [...arr1, ...arr2]        // 合并数组

// ✅ 推荐：数组解构
const [first, second] = [1, 2, 3]  // first=1, second=2
const [a, , c] = [1, 2, 3]         // 跳过元素
const [head, ...tail] = [1, 2, 3]  // head=1, tail=[2,3]

// ✅ 推荐：数组方法（不改变原数组）
const numbers = [1, 2, 3, 4, 5]

// filter - 过滤
const evens = numbers.filter(n => n % 2 === 0)  // [2, 4]

// map - 映射
const doubled = numbers.map(n => n * 2)  // [2, 4, 6, 8, 10]

// reduce - 归约
const sum = numbers.reduce((total, n) => total + n, 0)  // 15

// find - 查找单个元素
const found = numbers.find(n => n > 3)  // 4

// some - 至少一个满足
const hasLarge = numbers.some(n => n > 3)  // true

// every - 全部满足
const allPositive = numbers.every(n => n > 0)  // true

// includes - 包含元素
numbers.includes(3)  // true

// slice - 切片（不改变原数组）
numbers.slice(1, 3)  // [2, 3]

// ✅ 推荐：链式调用
const result = numbers
  .filter(n => n % 2 === 0)   // [2, 4]
  .map(n => n * 2)            // [4, 8]
  .reduce((sum, n) => sum + n, 0)  // 12

// ⚠️ 注意：会改变原数组的方法
const arr = [1, 2, 3]
arr.push(4)      // 添加到末尾
arr.pop()        // 删除末尾
arr.unshift(0)   // 添加到开头
arr.shift()      // 删除开头
arr.splice(1, 1) // 删除/插入
arr.sort()       // 排序
arr.reverse()    // 反转

// ✅ 推荐：不改变原数组的替代方案
const newArr = [...arr, 4]           // 代替 push
const withoutLast = arr.slice(0, -1) // 代替 pop
const sorted = [...arr].sort()       // 代替 sort
```

---

## 异步编程

### 1. Promise 基础

```javascript
// ✅ 推荐：创建 Promise
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    const success = true
    if (success) {
      resolve('Success!')
    } else {
      reject(new Error('Failed!'))
    }
  }, 1000)
})

// ✅ 推荐：使用 Promise
promise
  .then(result => {
    console.log(result)
    return 'Next step'
  })
  .then(result => {
    console.log(result)
  })
  .catch(error => {
    console.error(error)
  })
  .finally(() => {
    console.log('Cleanup')
  })

// ✅ 推荐：Promise.all（并行执行，全部成功）
const promises = [
  fetch('/api/user/1'),
  fetch('/api/user/2'),
  fetch('/api/user/3')
]

Promise.all(promises)
  .then(results => {
    console.log('All users:', results)
  })
  .catch(error => {
    console.error('At least one failed:', error)
  })

// ✅ 推荐：Promise.race（返回最快的）
Promise.race([
  fetch('/api/fast'),
  fetch('/api/slow')
])
  .then(result => {
    console.log('Fastest:', result)
  })

// ✅ 推荐：Promise.allSettled（全部完成，不管成功失败）
Promise.allSettled(promises)
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`${index} succeeded:`, result.value)
      } else {
        console.log(`${index} failed:`, result.reason)
      }
    })
  })
```

### 2. Async/Await（推荐）

```javascript
// ✅ 推荐：async/await 基础
async function fetchUser(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`)
    const user = await response.json()
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw error
  }
}

// ✅ 推荐：错误处理
async function fetchWithErrorHandling() {
  try {
    const user = await fetchUser(1)
    const profile = await fetchProfile(user.id)
    return { user, profile }
  } catch (error) {
    // 处理错误
    console.error('Error:', error)
    return null
  } finally {
    // 清理工作
    console.log('Cleanup')
  }
}

// ✅ 推荐：并行请求（使用 Promise.all）
async function fetchMultipleUsers() {
  try {
    const [user1, user2, user3] = await Promise.all([
      fetchUser(1),
      fetchUser(2),
      fetchUser(3)
    ])
    return [user1, user2, user3]
  } catch (error) {
    console.error('Failed:', error)
  }
}

// ✅ 推荐：串行请求（按顺序）
async function fetchInSequence() {
  const user = await fetchUser(1)
  const posts = await fetchPosts(user.id)  // 依赖 user.id
  const comments = await fetchComments(posts[0].id)  // 依赖 posts
  return { user, posts, comments }
}

// ❌ 禁止：回调地狱
function badAsync(userId, callback) {
  fetchUser(userId, (error, user) => {
    if (error) return callback(error)
    fetchProfile(user.id, (error, profile) => {
      if (error) return callback(error)
      fetchPosts(user.id, (error, posts) => {
        if (error) return callback(error)
        callback(null, { user, profile, posts })
      })
    })
  })
}

// ✅ 推荐：使用 async/await 重写
async function betterAsync(userId) {
  try {
    const user = await fetchUser(userId)
    const profile = await fetchProfile(user.id)
    const posts = await fetchPosts(user.id)
    return { user, profile, posts }
  } catch (error) {
    throw error
  }
}
```

### 3. 常见异步模式

```javascript
// ✅ 模式 1：带超时的请求
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

// ✅ 模式 2：重试机制
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)
      return await response.json()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      console.log(`Retry ${i + 1}/${maxRetries}`)
      await sleep(1000 * (i + 1))  // 指数退避
    }
  }
}

// ✅ 模式 3：并发控制
async function fetchWithConcurrencyLimit(urls, limit = 3) {
  const results = []
  const executing = []
  
  for (const url of urls) {
    const promise = fetch(url).then(res => res.json())
    results.push(promise)
    
    if (limit <= urls.length) {
      const execute = promise.then(() => {
        executing.splice(executing.indexOf(execute), 1)
      })
      executing.push(execute)
      
      if (executing.length >= limit) {
        await Promise.race(executing)
      }
    }
  }
  
  return Promise.all(results)
}

// 工具函数：sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

---

## TypeScript 基础

### 1. 基本类型

```typescript
// ✅ 基础类型
const isDone: boolean = false
const count: number = 42
const name: string = 'Alice'
const notSure: any = 4  // ⚠️ 尽量避免使用 any

// ✅ 数组类型
const numbers: number[] = [1, 2, 3]
const strings: Array<string> = ['a', 'b', 'c']

// ✅ 元组类型
const tuple: [string, number] = ['Alice', 25]

// ✅ 枚举
enum Color {
  Red,
  Green,
  Blue
}
const color: Color = Color.Red

// ✅ 联合类型
let value: string | number
value = 'hello'
value = 42

// ✅ 字面量类型
let status: 'pending' | 'success' | 'error'
status = 'pending'

// ✅ null 和 undefined
let nullable: string | null = null
let optional: string | undefined

// ✅ void
function logMessage(message: string): void {
  console.log(message)
}

// ✅ never（永不返回）
function throwError(message: string): never {
  throw new Error(message)
}
```

### 2. 接口和类型别名

```typescript
// ✅ 接口定义
interface User {
  id: number
  name: string
  email: string
  age?: number  // 可选属性
  readonly createTime: Date  // 只读属性
}

// ✅ 类型别名
type UserId = number
type UserRole = 'admin' | 'user' | 'guest'

// ✅ 函数类型
interface SearchFunc {
  (source: string, subString: string): boolean
}

type AddFunc = (a: number, b: number) => number

// ✅ 对象类型
const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  createTime: new Date()
}

// ✅ 扩展接口
interface ExtendedUser extends User {
  role: UserRole
  permissions: string[]
}

// ✅ 交叉类型
type AdminUser = User & {
  adminLevel: number
}

// ✅ 索引签名
interface Dictionary {
  [key: string]: string
}

const dict: Dictionary = {
  hello: '你好',
  goodbye: '再见'
}
```

### 3. 泛型

```typescript
// ✅ 泛型函数
function identity<T>(arg: T): T {
  return arg
}

const num = identity<number>(42)
const str = identity<string>('hello')
const auto = identity(42)  // 类型推断

// ✅ 泛型接口
interface Response<T> {
  code: number
  message: string
  data: T
}

const userResponse: Response<User> = {
  code: 200,
  message: 'Success',
  data: {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    createTime: new Date()
  }
}

// ✅ 泛型类
class GenericList<T> {
  private items: T[] = []
  
  add(item: T): void {
    this.items.push(item)
  }
  
  get(index: number): T {
    return this.items[index]
  }
}

const numberList = new GenericList<number>()
numberList.add(1)
numberList.add(2)

// ✅ 泛型约束
interface HasLength {
  length: number
}

function logLength<T extends HasLength>(arg: T): void {
  console.log(arg.length)
}

logLength('hello')  // ✅
logLength([1, 2, 3])  // ✅
// logLength(42)  // ❌ 错误
```

---

## 错误处理

```javascript
// ✅ 推荐：try-catch
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch data:', error)
    throw error
  }
}

// ✅ 推荐：自定义错误类
class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.name = 'NetworkError'
    this.statusCode = statusCode
  }
}

// ✅ 推荐：错误处理最佳实践
async function processUser(userId) {
  try {
    // 验证输入
    if (!userId) {
      throw new ValidationError('User ID is required', 'userId')
    }
    
    // 发起请求
    const response = await fetch(`/api/users/${userId}`)
    
    // 检查响应
    if (!response.ok) {
      throw new NetworkError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      )
    }
    
    const user = await response.json()
    
    // 验证数据
    if (!user.id || !user.name) {
      throw new ValidationError('Invalid user data', 'user')
    }
    
    return user
  } catch (error) {
    // 分类处理错误
    if (error instanceof ValidationError) {
      console.error('Validation error:', error.message, error.field)
    } else if (error instanceof NetworkError) {
      console.error('Network error:', error.message, error.statusCode)
    } else {
      console.error('Unknown error:', error)
    }
    
    // 重新抛出或返回默认值
    throw error
  }
}
```

---

## 性能优化

### 1. 防抖和节流

```javascript
// ✅ 防抖（debounce）：最后一次触发后延迟执行
function debounce(func, delay) {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 使用场景：搜索输入、窗口调整
const searchInput = document.querySelector('#search')
const handleSearch = debounce((event) => {
  console.log('Search:', event.target.value)
}, 300)
searchInput.addEventListener('input', handleSearch)

// ✅ 节流（throttle）：固定时间间隔执行
function throttle(func, delay) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      func.apply(this, args)
      lastTime = now
    }
  }
}

// 使用场景：滚动事件、鼠标移动
const handleScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY)
}, 100)
window.addEventListener('scroll', handleScroll)
```

### 2. 延迟加载

```javascript
// ✅ 动态导入
async function loadComponent() {
  const { default: Component } = await import('./Component.vue')
  return Component
}

// ✅ Vue Router 懒加载
const router = new VueRouter({
  routes: [
    {
      path: '/user/:id',
      component: () => import('./views/User.vue')
    }
  ]
})
```

---

## 最佳实践检查清单

- [ ] 使用 const/let，禁止 var
- [ ] 使用模板字符串代替字符串拼接
- [ ] 使用箭头函数（回调场景）
- [ ] 使用对象/数组解构
- [ ] 使用展开运算符
- [ ] 使用 async/await 代替 Promise 链
- [ ] 使用数组方法（map、filter、reduce）
- [ ] 严格相等（===）代替相等（==）
- [ ] 明确的变量命名
- [ ] 函数职责单一
- [ ] 完善的错误处理
- [ ] 添加类型注解（TypeScript）

---

## 学习资源

- [MDN JavaScript 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [ES6 入门教程](https://es6.ruanyifeng.com/)
- [TypeScript 官方文档](https://www.typescriptlang.org/zh/)
- [JavaScript.info](https://zh.javascript.info/)
