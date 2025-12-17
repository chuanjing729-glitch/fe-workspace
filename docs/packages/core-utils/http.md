# HTTP 请求工具

基于原生 fetch API 的 HTTP 客户端，提供请求/响应拦截、错误处理、超时控制等功能，**零依赖**。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用

```typescript
import { HttpClient, createHttpClient, http } from '@51jbs/core-utils'
```

## API

### HttpClient 类

HTTP 客户端类

**构造函数**

```typescript
new HttpClient(config?: RequestConfig)
```

**配置项 RequestConfig**

```typescript
interface RequestConfig {
  baseURL?: string           // 基础URL
  timeout?: number          // 超时时间(ms)，默认10000
  headers?: Record<string, string>  // 默认请求头
  credentials?: RequestCredentials  // 凭证模式，默认'same-origin'
  mode?: RequestMode        // 请求模式，默认'cors'
}
```

**示例**

```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Custom-Header': 'value'
  }
})
```

---

### GET 请求

```typescript
get<T>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T>
```

**示例**

```typescript
// 基础请求
const data = await client.get('/users')

// 带参数
const user = await client.get('/users/1', { include: 'profile' })

// 自定义选项
const list = await client.get('/list', { page: 1 }, { timeout: 3000 })
```

---

### POST 请求

```typescript
post<T>(url: string, data?: any, options?: RequestOptions): Promise<T>
```

**示例**

```typescript
// 创建用户
const newUser = await client.post('/users', {
  name: '张三',
  email: 'zhang@example.com'
})

// 上传表单
const formData = new FormData()
formData.append('file', file)
await client.post('/upload', formData)
```

---

### PUT 请求

```typescript
put<T>(url: string, data?: any, options?: RequestOptions): Promise<T>
```

**示例**

```typescript
// 更新用户
await client.put('/users/1', {
  name: '李四'
})
```

---

### DELETE 请求

```typescript
delete<T>(url: string, options?: RequestOptions): Promise<T>
```

**示例**

```typescript
// 删除用户
await client.delete('/users/1')
```

---

### PATCH 请求

```typescript
patch<T>(url: string, data?: any, options?: RequestOptions): Promise<T>
```

**示例**

```typescript
// 部分更新
await client.patch('/users/1', {
  email: 'newemail@example.com'
})
```

---

### createHttpClient

创建 HTTP 客户端实例

```typescript
function createHttpClient(config?: RequestConfig): HttpClient
```

**示例**

```typescript
// 为不同API创建独立客户端
const apiV1 = createHttpClient({ baseURL: 'https://api.example.com/v1' })
const apiV2 = createHttpClient({ baseURL: 'https://api.example.com/v2' })
```

---

### http

默认 HTTP 客户端实例（单例）

**示例**

```typescript
import { http } from '@51jbs/core-utils'

// 直接使用默认实例
const data = await http.get('/api/users')
```

## 特性

### 1. 自动Token管理

HTTP客户端自动从 localStorage 读取 token 并添加到请求头：

```typescript
// 自动添加 Authorization: Bearer <token>
const data = await client.get('/protected-api')
```

### 2. 请求拦截

- 自动添加时间戳到 GET 请求（防止缓存）
- 自动添加认证 token

### 3. 响应拦截

- 自动处理 HTTP 错误状态码（401、403、404、500等）
- 自动处理业务错误（code !== 200）
- 401自动清除token

### 4. 超时控制

```typescript
const client = new HttpClient({ timeout: 5000 })

// 单个请求覆盖超时
await client.get('/slow-api', {}, { timeout: 10000 })
```

### 5. 错误处理

```typescript
try {
  const data = await client.get('/api/users')
} catch (error) {
  if (error.message.includes('timeout')) {
    // 处理超时
  } else if (error.message.includes('HTTP Error')) {
    // 处理HTTP错误
  } else {
    // 处理其他错误
  }
}
```

## 使用场景

### 1. Vue项目集成

```typescript
// api/http.ts
import { createHttpClient } from '@51jbs/core-utils'

export const http = createHttpClient({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 10000
})

// api/user.ts
import { http } from './http'

export const userApi = {
  getList: (params) => http.get('/users', params),
  getById: (id) => http.get(`/users/${id}`),
  create: (data) => http.post('/users', data),
  update: (id, data) => http.put(`/users/${id}`, data),
  delete: (id) => http.delete(`/users/${id}`)
}
```

### 2. 多环境配置

```typescript
// config/http.ts
const baseURLs = {
  development: 'http://localhost:3000/api',
  staging: 'https://staging-api.example.com',
  production: 'https://api.example.com'
}

export const http = createHttpClient({
  baseURL: baseURLs[process.env.NODE_ENV],
  timeout: 10000
})
```

### 3. 请求封装

```typescript
// services/user.service.ts
import { http } from '@/config/http'

class UserService {
  async login(username: string, password: string) {
    const res = await http.post('/auth/login', { username, password })
    // 保存token
    localStorage.setItem('token', res.token)
    return res.user
  }
  
  async getProfile() {
    return http.get('/user/profile')
  }
  
  async updateProfile(data: any) {
    return http.put('/user/profile', data)
  }
}

export default new UserService()
```

### 4. 错误统一处理

```typescript
class ApiService {
  private http: HttpClient
  
  constructor() {
    this.http = createHttpClient({
      baseURL: process.env.API_BASE_URL
    })
  }
  
  async request<T>(
    method: string, 
    url: string, 
    data?: any
  ): Promise<T> {
    try {
      return await this.http[method](url, data)
    } catch (error) {
      // 统一错误处理
      this.handleError(error)
      throw error
    }
  }
  
  private handleError(error: any) {
    if (error.message.includes('401')) {
      // 跳转登录
      window.location.href = '/login'
    } else if (error.message.includes('timeout')) {
      // 提示超时
      this.$message.error('请求超时，请重试')
    }
  }
}
```

## 最佳实践

### 1. API模块化

```typescript
// api/modules/user.ts
export default {
  getList: (params) => http.get('/users', params),
  getDetail: (id) => http.get(`/users/${id}`),
  create: (data) => http.post('/users', data),
  update: (id, data) => http.put(`/users/${id}`, data),
  delete: (id) => http.delete(`/users/${id}`)
}

// api/index.ts
import user from './modules/user'
import product from './modules/product'

export default {
  user,
  product
}

// 使用
import api from '@/api'
const users = await api.user.getList({ page: 1 })
```

### 2. TypeScript类型定义

```typescript
interface User {
  id: number
  name: string
  email: string
}

interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

// 带类型的请求
const res = await http.get<ApiResponse<User[]>>('/users')
const users = res.data
```

### 3. 请求取消（配合AbortController）

```typescript
const controller = new AbortController()

// 发起可取消的请求
http.get('/api/search', { keyword: 'vue' }, {
  signal: controller.signal
})

// 取消请求
controller.abort()
```

## 与 axios 对比

| 特性 | @51jbs/http | axios |
|------|-------------|-------|
| 包大小 | ~3KB | ~15KB |
| 依赖 | 零依赖 | 多个依赖 |
| API | 现代化 fetch | XMLHttpRequest |
| TypeScript | 原生支持 | 需配置 |
| 浏览器兼容 | 现代浏览器 | IE11+ |

## Changelog

| 版本 | 变更内容 | 修改人 | 日期 |
|------|---------|--------|------|
| 1.0.0 | 初始版本，基于fetch实现零依赖HTTP客户端 | chuanjing.li | 2024-12-15 |
