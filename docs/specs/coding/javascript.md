# JavaScript 开发规范

## 基础语法规范

### 变量声明
```javascript
// ✅ 推荐：优先使用 const，需要重新赋值时使用 let
const userName = 'zhangsan'
let userAge = 25
userAge = 26

// ❌ 禁止：使用 var
var oldStyle = 'deprecated'

// ✅ 推荐：对象解构
const { name, age } = user
const { id: userId, name: userName } = user

// ✅ 推荐：数组解构
const [first, second] = list

// ✅ 推荐：默认值
function createUser(name = 'Anonymous', age = 0) {
  return { name, age }
}
```

### 字符串处理
```javascript
// ✅ 推荐：模板字符串
const message = `Hello ${userName}, you are ${age} years old`

// ✅ 推荐：多行字符串
const html = `
  <div class="user-card">
    <h3>${userName}</h3>
    <p>Age: ${age}</p>
  </div>
`

// ❌ 禁止：字符串拼接
const badMessage = 'Hello ' + userName + ', you are ' + age + ' years old'
```

### 数组操作
```javascript
// ✅ 推荐：使用现代数组方法
const activeUsers = users.filter(user => user.isActive)
const userNames = users.map(user => user.name)
const hasAdmin = users.some(user => user.role === 'admin')
const allActive = users.every(user => user.isActive)

// ✅ 推荐：展开运算符
const newList = [...oldList, newItem]
const merged = [...list1, ...list2]

// ❌ 禁止：使用 for 循环替代数组方法（除非性能要求极高）
for (let i = 0; i < users.length; i++) {
  if (users[i].isActive) {
    activeUsers.push(users[i])
  }
}
```

### 对象操作
```javascript
// ✅ 推荐：对象属性简写
const user = { name, age, isActive }

// ✅ 推荐：计算属性名
const key = 'dynamicKey'
const obj = {
  [key]: 'value',
  [`${key}Suffix`]: 'anotherValue'
}

// ✅ 推荐：对象展开
const newUser = { ...oldUser, age: 26 }
const mergedObj = { ...obj1, ...obj2 }

// ✅ 推荐：对象解构
const { name, age, ...rest } = user
```

## 函数规范

### 函数定义
```javascript
// ✅ 推荐：箭头函数（适用于简单逻辑）
const add = (a, b) => a + b
const greet = name => `Hello ${name}`

// ✅ 推荐：普通函数（复杂逻辑、需要 this）
function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price, 0)
}

// ✅ 推荐：立即执行函数表达式
const moduleId = (() => {
  let id = 0
  return () => ++id
})()

// ❌ 禁止：匿名函数表达式
setTimeout(function() {
  console.log('timeout')
}, 1000)
```

### 参数处理
```javascript
// ✅ 推荐：参数默认值
function createUser(name = 'Anonymous', options = {}) {
  const { age = 0, role = 'user' } = options
  return { name, age, role }
}

// ✅ 推荐：剩余参数
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0)
}

// ❌ 禁止：arguments 对象
function badSum() {
  let total = 0
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i]
  }
  return total
}
```

### 异步编程
```javascript
// ✅ 推荐：async/await
async function fetchUserData(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`)
    const user = await response.json()
    return user
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw error
  }
}

// ✅ 推荐：Promise 链
function processData(data) {
  return fetchData()
    .then(response => response.json())
    .then(json => transformData(json))
    .catch(error => {
      console.error('Processing failed:', error)
      throw error
    })
}

// ❌ 禁止：回调地狱
function badAsync(userId, callback) {
  fetchUser(userId, (error, user) => {
    if (error) return callback(error)
    fetchProfile(user.id, (error, profile) => {
      if (error) return callback(error)
      callback(null, { user, profile })
    })
  })
}
```

## 错误处理规范

```javascript
// ✅ 推荐：自定义错误类
class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

// ✅ 推荐：统一错误处理
async function fetchUser(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    // 记录错误日志
    console.error('Fetch user failed:', error)
    // 抛出自定义错误
    throw new ValidationError('获取用户信息失败', 'userId')
  }
}
```