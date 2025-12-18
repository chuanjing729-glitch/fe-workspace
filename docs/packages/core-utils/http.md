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

HTTP 客户端类，提供完整的 HTTP 请求功能。

#### 构造函数

```typescript
constructor(config?: RequestConfig)
```

**参数**
- `config` - 配置对象（可选）
  - `baseURL` - 基础URL前缀
  - `timeout` - 超时时间（毫秒），默认10000
  - `headers` - 默认请求头
  - `credentials` - 凭证模式，默认'same-origin'
  - `mode` - 请求模式，默认'cors'

**示例**
```typescript
// 创建自定义配置的HTTP客户端
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value'
  }
});
```

#### get 方法

发起 GET 请求。

**类型签名**
```typescript
get<T = any>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T>
```

**参数**
- `url` - 请求URL
- `params` - 查询参数（可选）
- `options` - 请求选项（可选）

**返回值**
- Promise，解析为响应数据

**示例**
```typescript
// 基础GET请求
const users = await client.get('/users');

// 带参数的GET请求
const user = await client.get('/users', { id: 123 });

// 带选项的GET请求
const data = await client.get('/users', { page: 1 }, { 
  headers: { 'Authorization': 'Bearer token' } 
});
```

#### post 方法

发起 POST 请求。

**类型签名**
```typescript
post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
```

**参数**
- `url` - 请求URL
- `data` - 请求体数据（可选）
- `options` - 请求选项（可选）

**返回值**
- Promise，解析为响应数据

**示例**
```typescript
// 基础POST请求
const newUser = await client.post('/users', { name: 'John', email: 'john@example.com' });

// 带选项的POST请求
const result = await client.post('/users', { name: 'John' }, { 
  headers: { 'Authorization': 'Bearer token' } 
});
```

#### put 方法

发起 PUT 请求。

**类型签名**
```typescript
put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
```

**参数**
- `url` - 请求URL
- `data` - 请求体数据（可选）
- `options` - 请求选项（可选）

**返回值**
- Promise，解析为响应数据

**示例**
```typescript
// PUT请求
const updatedUser = await client.put('/users/123', { name: 'John Doe' });
```

#### delete 方法

发起 DELETE 请求。

**类型签名**
```typescript
delete<T = any>(url: string, options?: RequestOptions): Promise<T>
```

**参数**
- `url` - 请求URL
- `options` - 请求选项（可选）

**返回值**
- Promise，解析为响应数据

**示例**
```typescript
// DELETE请求
await client.delete('/users/123');
```

#### patch 方法

发起 PATCH 请求。

**类型签名**
```typescript
patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
```

**参数**
- `url` - 请求URL
- `data` - 请求体数据（可选）
- `options` - 请求选项（可选）

**返回值**
- Promise，解析为响应数据

**示例**
```typescript
// PATCH请求
const patchedUser = await client.patch('/users/123', { name: 'John Smith' });
```

---

### createHttpClient 函数

创建HTTP客户端实例。

**类型签名**
```typescript
function createHttpClient(config?: RequestConfig): HttpClient
```

**参数**
- `config` - 配置对象（可选）

**返回值**
- HttpClient实例

**示例**
```typescript
// 创建自定义HTTP客户端
const apiClient = createHttpClient({
  baseURL: 'https://api.myapp.com',
  timeout: 8000
});

// 使用客户端发起请求
const data = await apiClient.get('/endpoint');
```

---

### http 实例

默认HTTP客户端实例（单例）。

**示例**
```typescript
import { http } from '@51jbs/core-utils'

// 直接使用默认实例
const data = await http.get('/api/users')

// 发起POST请求
const newUser = await http.post('/api/users', { name: 'John' })
```

## 功能特性

### 请求拦截器

自动添加认证token和防止缓存的时间戳。

### 响应拦截器

统一处理HTTP错误和业务错误。

### 超时控制

可配置的请求超时时间，超时后自动中止请求。

### 错误处理

完善的错误处理机制：
- HTTP状态码错误（401、403、404、500等）
- 网络错误
- 超时错误
- 业务错误（基于响应中的code字段）

### TypeScript支持

完整的TypeScript类型定义，提供良好的开发体验和类型检查。