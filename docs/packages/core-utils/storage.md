# Storage 存储操作工具

存储模块提供了对 LocalStorage、SessionStorage 和 Cookie 的封装，支持 JSON 自动对象序列化以及全局数据过期管理。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用方式

```typescript
import { local, session, storage, cookie } from '@51jbs/core-utils';
```

## API 参考

### local

对 `localStorage` 的封装，支持自动 `JSON.stringify/parse`。

**源码实现**
<<< @/packages/core-utils/src/storage/index.ts{8-57}

**示例**
```typescript
local.set('user', { name: 'Chuanjing Li', role: 'admin' });
const user = local.get('user'); // { name: 'Chuanjing Li', role: 'admin' }
local.has('user'); // true
local.remove('user');
```

---

### session

对 `sessionStorage` 的封装。

**源码实现**
<<< @/packages/core-utils/src/storage/index.ts{62-111}

---

### storage

带过期时间的存储方案（利用 `local` 进行底层实现）。

**源码实现**
<<< @/packages/core-utils/src/storage/index.ts{116-156}

**示例**
```typescript
// 设置 1 小时后过期的数据
storage.set('token', 'abc-123', 3600 * 1000);

// 获取时会自动检查过期时间，如果已过期则返回 null 并清除该键
const token = storage.get('token');
```

---

### cookie

对 `document.cookie` 的封装。

**源码实现**
<<< @/packages/core-utils/src/storage/index.ts{161-235}

**示例**
```typescript
cookie.set('theme', 'dark', { expires: 7, path: '/' });
const theme = cookie.get('theme'); // 'dark'
cookie.remove('theme');
```
