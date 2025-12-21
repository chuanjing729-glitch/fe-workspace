# URL 处理工具

URL 模块提供了一系列解析、构建和操作 URL 参数的实用函数。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用方式

```typescript
import { 
  parseUrlParams, 
  removeUrlParams, 
  buildUrlParams, 
  buildFullUrl,
  isExternal,
  getQueryParam
} from '@51jbs/core-utils';
```

## API 参考

### parseUrlParams

解析 URL 参数为对象。

**源码实现**
<<< @/packages/core-utils/src/url/index.ts{10-31}

**类型签名**
```typescript
function parseUrlParams(url?: string): Record<string, string>
```

**示例**
```typescript
// 假设当前 URL 为 http://example.com/?id=123&name=test
const params = parseUrlParams(); // { id: '123', name: 'test' }

const params2 = parseUrlParams('http://example.com/?k=v'); // { k: 'v' }
```

---

### removeUrlParams

删除 URL 中指定的参数。

**源码实现**
<<< @/packages/core-utils/src/url/index.ts{39-78}

**类型签名**
```typescript
function removeUrlParams(url: string, params: string[]): string
```

**示例**
```typescript
const url = 'http://example.com/?id=1&name=test';
removeUrlParams(url, ['name']); // "http://example.com/?id=1"
```

---

### buildUrlParams

构建 URL 参数字符串。

**源码实现**
<<< @/packages/core-utils/src/url/index.ts{85-98}

**类型签名**
```typescript
function buildUrlParams(params: Record<string, any>): string
```

**示例**
```typescript
buildUrlParams({ id: 1, name: 'test' }); // "id=1&name=test"
```

---

### buildFullUrl

构建完整的带参数 URL。

**源码实现**
<<< @/packages/core-utils/src/url/index.ts{106-114}

**类型签名**
```typescript
function buildFullUrl(baseUrl: string, params?: Record<string, any>): string
```

**示例**
```typescript
buildFullUrl('http://example.com', { id: 1 }); // "http://example.com?id=1"
buildFullUrl('http://example.com?type=1', { id: 2 }); // "http://example.com?type=1&id=2"
```

---

### isExternal

检查是否为外部链接（http, https, mailto, tel）。

**源码实现**
<<< @/packages/core-utils/src/url/index.ts{121-123}

**类型签名**
```typescript
function isExternal(path: string): boolean
```

**示例**
```typescript
isExternal('https://google.com'); // true
isExternal('/home'); // false
```

---

### getQueryParam

获取 URL 中指定的查询参数值。

**源码实现**
<<< @/packages/core-utils/src/url/index.ts{131-140}

**类型签名**
```typescript
function getQueryParam(name: string, url?: string): string | null
```

**示例**
```typescript
getQueryParam('id', 'http://example.com/?id=123'); // "123"
```
