# Object 对象操作工具

对象操作工具提供了一系列处理 JavaScript 对象的函数，包括深拷贝、浅拷贝、对象合并和判空等常用操作。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用方式

```typescript
import { 
  deepClone, 
  shallowClone, 
  merge, 
  isEmpty 
} from '@51jbs/core-utils';

// 或者
import * as objectUtils from '@51jbs/core-utils';
```

## API 参考

### deepClone

深拷贝对象，解决 `JSON.parse(JSON.stringify())` 的问题。

**源码实现**
<<< @/packages/core-utils/src/object/index.ts{15-67}

**特点**：
1. 支持循环引用
2. 支持函数、Date、RegExp 等特殊对象
3. 支持 Symbol

**类型签名**
```typescript
function deepClone<T>(obj: T, hash?: WeakMap<object, any>): T
```

**参数**
- `obj` - 要拷贝的对象
- `hash` - WeakMap 用于处理循环引用（可选）

**返回值**
- 深拷贝后的对象

**示例**
```typescript
const obj = {
  a: 1,
  b: { c: 2 },
  d: new Date(),
  e: /regex/g,
  f: function() { return 'test'; }
};

// 支持循环引用
obj.self = obj;

const cloned = deepClone(obj);
console.log(cloned); // 深拷贝后的对象，包含所有属性 and 循环引用
```

---

### shallowClone

浅拷贝对象或数组。

**源码实现**
<<< @/packages/core-utils/src/object/index.ts{72-82}

**类型签名**
```typescript
function shallowClone<T>(obj: T): T
```

**参数**
- `obj` - 要拷贝的对象或数组

**返回值**
- 浅拷贝后的对象或数组

**示例**
```typescript
const obj = { a: 1, b: { c: 2 } };
const cloned = shallowClone(obj);
cloned.b.c = 3;
console.log(obj.b.c); // 3（浅拷贝，内部对象仍指向同一引用）

const arr = [1, 2, { a: 3 }];
const clonedArr = shallowClone(arr);
clonedArr[2].a = 4;
console.log(arr[2].a); // 4（浅拷贝，数组内的对象仍指向同一引用）
```

---

### merge

合并对象（深度合并）。

**源码实现**
<<< @/packages/core-utils/src/object/index.ts{87-110}

**类型签名**
```typescript
function merge<T extends object>(target: T, ...sources: Partial<T>[]): T
```

**参数**
- `target` - 目标对象
- `sources` - 源对象数组

**返回值**
- 合并后的对象

**示例**
```typescript
const target = { a: 1, b: { c: 2 } };
const source = { b: { d: 3 }, e: 4 };
const merged = merge(target, source);
console.log(merged); // { a: 1, b: { c: 2, d: 3 }, e: 4 }

// 多个源对象
const source1 = { a: 5, f: { g: 6 } };
const source2 = { f: { h: 7 } };
const merged2 = merge(target, source1, source2);
console.log(merged2); // { a: 5, b: { c: 2, d: 3 }, e: 4, f: { g: 6, h: 7 } }
```

---

### isEmpty

判断对象是否为空。

**源码实现**
<<< @/packages/core-utils/src/object/index.ts{122-127}

**类型签名**
```typescript
function isEmpty(obj: any): boolean
```

**参数**
- `obj` - 要检查的值

**返回值**
- 如果对象为空则返回 true，否则返回 false

**示例**
```typescript
isEmpty({}); // true
isEmpty([]); // true
isEmpty(''); // true
isEmpty(null); // true
isEmpty(undefined); // true

isEmpty({ a: 1 }); // false
isEmpty([1]); // false
isEmpty('test'); // false
```

---

### safeGet

安全地从对象中获取深层属性（类似 `_.get`）。

**源码实现**
<<< @/packages/core-utils/src/object/index.ts{135-149}

**类型签名**
```typescript
function safeGet<T = any>(obj: any, path: string, defaultValue?: T): T
```

**参数**
- `obj` - 目标对象
- `path` - 路径字符串（如 'a.b.c'）
- `defaultValue` - 默认值（可选）

**返回值**
- 对应路径的值，如果路径不存在或为 null/undefined，则返回默认值。

**示例**
```typescript
const obj = { a: { b: { c: 1 } } }

safeGet(obj, 'a.b.c') // 1
safeGet(obj, 'a.b.d', 'fallback') // 'fallback'
safeGet(obj, 'x.y.z', 0) // 0
```