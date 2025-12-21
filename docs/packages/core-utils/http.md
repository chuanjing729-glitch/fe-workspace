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

初始化 HTTP 客户端。

**源码实现**
<<< @/packages/core-utils/src/http/index.ts{24-35}

**示例**
```typescript
const client = new HttpClient({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

---

#### get 方法

发起 GET 请求。

**源码实现**
<<< @/packages/core-utils/src/http/index.ts{208-214}

**类型签名**
```typescript
get<T = any>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<T>
```

**示例**
```typescript
const user = await client.get('/users', { id: 123 });
```

---

#### post 方法

发起 POST 请求。

**源码实现**
<<< @/packages/core-utils/src/http/index.ts{219-225}

**类型签名**
```typescript
post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
```

**示例**
```typescript
const newUser = await client.post('/users', { name: 'John' });
```

---

#### put 方法

发起 PUT 请求。

**源码实现**
<<< @/packages/core-utils/src/http/index.ts{230-236}

**类型签名**
```typescript
put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
```

---

#### delete 方法

发起 DELETE 请求。

**源码实现**
<<< @/packages/core-utils/src/http/index.ts{241-246}

**类型签名**
```typescript
delete<T = any>(url: string, options?: RequestOptions): Promise<T>
```

---

#### patch 方法

发起 PATCH 请求。

**源码实现**
<<< @/packages/core-utils/src/http/index.ts{251-257}

**类型签名**
```typescript
patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T>
```

---

### createHttpClient 函数

创建 HTTP 客户端工厂函数。

**源码实现**
<<< @/packages/core-utils/src/http/index.ts{265-267}

---

### http 实例

默认 HTTP 客户端（单例）。

**源码实现**
<<< @/packages/core-utils/src/http/index.ts{272-272}

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