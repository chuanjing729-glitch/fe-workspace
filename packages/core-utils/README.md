# @51jbs/core-utils

> 纯 JS 工具库，框架无关，提供深拷贝、日期、数字精确计算等核心功能

## 📦 安装

```bash
npm install @51jbs/core-utils
```

## 🚀 快速使用

```javascript
import { deepClone, add, formatDate, maskPhone, local } from '@51jbs/core-utils'

// 深拷贝（支持循环引用）
const copy = deepClone(data)

// 精确数字计算
const result = add(0.1, 0.2)  // 0.3

// 日期格式化
const dateStr = formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')

// 手机号脱敏
const masked = maskPhone('13800138000')  // 138****8000

// 本地存储
local.set('user', { name: 'test' })
const user = local.get('user')
```

## 📚 API 文档

### 对象操作

```javascript
import { deepClone, shallowClone, merge, isEmpty } from '@51jbs/core-utils'

// 深拷贝（解决 JSON.parse(JSON.stringify()) 的问题）
const copy = deepClone(obj)  // 支持循环引用、Date、RegExp、Symbol

// 浅拷贝
const copy2 = shallowClone(obj)

// 深度合并
const merged = merge(obj1, obj2, obj3)

// 判空
isEmpty({})  // true
isEmpty([])  // true
isEmpty('')  // true
```

### 数字操作

```javascript
import { add, subtract, multiply, divide, formatNumber, formatCurrency } from '@51jbs/core-utils'

// 精确加法
add(0.1, 0.2)  // 0.3

// 精确减法
subtract(1.5, 1.2)  // 0.3

// 精确乘法
multiply(0.2, 0.1)  // 0.02

// 精确除法
divide(0.3, 0.1)  // 3

// 千分位格式化
formatNumber(123456.789)  // "123,456.79"

// 货币格式化
formatCurrency(1234.56)  // "¥1,234.56"
```

### 日期操作

```javascript
import { formatDate, dateDiff, getRelativeTime, isToday } from '@51jbs/core-utils'

// 格式化日期
formatDate(new Date(), 'YYYY-MM-DD')  // "2025-12-15"
formatDate(Date.now(), 'HH:mm:ss')    // "21:30:00"

// 日期差值（天数）
dateDiff('2025-12-01', '2025-12-15')  // 14

// 相对时间
getRelativeTime(Date.now() - 60000)  // "1分钟前"

// 判断是否为今天
isToday(new Date())  // true
```

### 字符串操作

```javascript
import { maskPhone, maskIdCard, maskEmail, isValidPhone } from '@51jbs/core-utils'

// 手机号脱敏
maskPhone('13800138000')  // "138****8000"

// 身份证脱敏
maskIdCard('110101199001011234')  // "110101********1234"

// 邮箱脱敏
maskEmail('test@example.com')  // "t***t@example.com"

// 验证手机号
isValidPhone('13800138000')  // true

// 其他工具
import { capitalize, camelToSnake, truncate, randomString } from '@51jbs/core-utils'

capitalize('hello')  // "Hello"
camelToSnake('userName')  // "user_name"
truncate('很长的文本...', 10)  // "很长的文本..."
randomString(8)  // "aB3dE9fG"
```

### 存储操作

```javascript
import { local, session, storage } from '@51jbs/core-utils'

// LocalStorage
local.set('key', { data: 'value' })
local.get('key')  // { data: 'value' }
local.has('key')  // true
local.remove('key')

// SessionStorage
session.set('key', 'value')
session.get('key')

// 带过期时间的存储
storage.set('key', 'value', 60000)  // 60秒后过期
storage.get('key')  // 自动检查过期
```

### 数组操作

```javascript
import { unique, groupBy, flatten, shuffle, sum, average, intersection, union, difference, chunk, paginate } from '@51jbs/core-utils'

// 数组去重
unique([1, 2, 2, 3])  // [1, 2, 3]

// 数组分组
groupBy([{name: 'Alice', age: 25}, {name: 'Bob', age: 25}], item => item.age)
// { '25': [{name: 'Alice', age: 25}, {name: 'Bob', age: 25}] }

// 数组扁平化
flatten([1, [2, [3, 4]]], 2)  // [1, 2, 3, 4]

// 数组乱序
shuffle([1, 2, 3, 4, 5])  // [3, 1, 4, 5, 2]

// 数组求和与平均值
sum([1, 2, 3, 4, 5])  // 15
average([1, 2, 3, 4, 5])  // 3

// 数组交集、并集、差集
intersection([1, 2, 3], [2, 3, 4])  // [2, 3]
union([1, 2], [2, 3])  // [1, 2, 3]
difference([1, 2, 3], [2, 3])  // [1]

// 数组分块和分页
chunk([1, 2, 3, 4, 5], 2)  // [[1, 2], [3, 4], [5]]
paginate([1, 2, 3, 4, 5], 2, 2)  // { data: [3, 4], total: 5, page: 2, pageSize: 2, totalPages: 3 }
```

### URL 操作

```javascript
import { parseUrlParams, buildUrlParams, buildFullUrl, isExternal, getQueryParam } from '@51jbs/core-utils'

// 解析 URL 参数
parseUrlParams('https://example.com?a=1&b=2')  // { a: '1', b: '2' }

// 构建 URL 参数
buildUrlParams({ a: 1, b: 2 })  // "a=1&b=2"

// 构建完整 URL
buildFullUrl('https://example.com', { a: 1 })  // "https://example.com?a=1"

// 检查是否为外部链接
isExternal('https://example.com')  // true

// 获取查询参数
getQueryParam('a', 'https://example.com?a=1')  // "1"
```

### 表单验证

```javascript
import { isPhone, isEmail, isIdCard, validatePassword, validateUsername } from '@51jbs/core-utils'

// 验证手机号、邮箱、身份证
isPhone('13800138000')  // true
isEmail('test@example.com')  // true
isIdCard('110101199001011234')  // true

// 密码验证
validatePassword('Abc123')  // { valid: true, message: '密码符合要求' }

// 用户名验证
validateUsername('test_user')  // { valid: true, message: '用户名符合要求' }
```

### 设备检测

```javascript
import { isMobile, isIOS, isAndroid, isWechat, getBrowserInfo } from '@51jbs/core-utils'

// 设备类型检测
isMobile()  // true/false
isIOS()  // true/false
isAndroid()  // true/false
isWechat()  // true/false

// 浏览器信息
getBrowserInfo()  // { name: 'Chrome', version: '98.0.4758.102' }
```

### DOM 操作

```javascript
import { addClass, removeClass, hasClass, scrollToElement, isInViewport } from '@51jbs/core-utils'

// 类名操作
addClass(element, 'active')
removeClass(element, 'active')
hasClass(element, 'active')

// 滚动到指定元素
scrollToElement('#target', { offset: 50 })

// 检查元素是否在视口中
isInViewport(element)
```

### 格式化工具

```javascript
import { formatPhone, formatCurrency, formatDate, formatFileSize, formatBankCard, formatIdCard } from '@51jbs/core-utils'

// 格式化手机号
formatPhone('13800138000')  // "138****8000"

// 格式化金额
formatCurrency(1234.56)  // "¥1,234.56"

// 格式化文件大小
formatFileSize(1024)  // "1 KB"

// 格式化银行卡号
formatBankCard('6222021234567890')  // "6222 0212 3456 7890"

// 格式化身份证号
formatIdCard('110101199001011234')  // "110101********1234"
```

### 事件管理

```javascript
import { EventBus, createEventBus, globalEventBus } from '@51jbs/core-utils'

// 使用全局事件总线
globalEventBus.on('update', (data) => console.log(data))
globalEventBus.emit('update', { message: 'hello' })

// 创建自定义事件总线
const bus = createEventBus()
const unsubscribe = bus.on('custom-event', (data) => console.log(data))
bus.emit('custom-event', { value: 123 })
unsubscribe()  // 取消订阅
```

### HTTP 请求

```javascript
import { http, createHttpClient } from '@51jbs/core-utils'

// 使用默认 HTTP 客户端
http.get('/api/users').then(data => console.log(data))
http.post('/api/users', { name: 'John' }).then(data => console.log(data))

// 创建自定义 HTTP 客户端
const client = createHttpClient({ baseURL: 'https://api.example.com' })
client.get('/users').then(data => console.log(data))
```

## 🎯 解决的问题

| 问题 | 解决方案 |
|------|---------|
| **64处不安全的深拷贝** | `deepClone()` 替代 `JSON.parse(JSON.stringify())` |
| **浮点数精度问题** | `add/subtract/multiply/divide()` 精确计算 |
| **日期格式化重复** | `formatDate()` 统一格式化 |
| **数据脱敏不统一** | `maskPhone/maskEmail/maskIdCard()` |
| **存储操作繁琐** | `local/session/storage` 封装 |
| **数组操作复杂** | `unique/groupBy/shuffle/sum` 等丰富数组工具 |
| **表单验证重复** | `isPhone/isEmail/validatePassword` 统一验证 |
| **设备检测困难** | `isMobile/isIOS/isWechat` 一键检测 |

## 📊 功能统计

- **2000+行**源码
- **13个模块**（object、number、date、string、storage、array、url、validation、device、dom、format、event、http）
- **100+个函数**

## 📄 License

MIT © Chuanjing Li