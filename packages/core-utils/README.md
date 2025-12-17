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

## 🎯 解决的问题

| 问题 | 解决方案 |
|------|---------|
| **64处不安全的深拷贝** | `deepClone()` 替代 `JSON.parse(JSON.stringify())` |
| **浮点数精度问题** | `add/subtract/multiply/divide()` 精确计算 |
| **日期格式化重复** | `formatDate()` 统一格式化 |
| **数据脱敏不统一** | `maskPhone/maskEmail/maskIdCard()` |
| **存储操作繁琐** | `local/session/storage` 封装 |

## 📊 功能统计

- **609行**源码
- **5个模块**（object、number、date、string、storage）
- **30+个函数**

## 📄 License

MIT © 51jbs Frontend Team
