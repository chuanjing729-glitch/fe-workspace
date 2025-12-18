# Array 数组操作工具

数组操作工具提供了一系列处理 JavaScript 数组的函数，包括去重、分组、扁平化、乱序、数学运算、集合运算、分块和分页等常用操作。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用方式

```typescript
import { 
  unique, 
  uniqueBy, 
  groupBy, 
  flatten, 
  shuffle,
  max,
  min,
  sum,
  average,
  intersection,
  union,
  difference,
  chunk,
  paginate
} from '@51jbs/core-utils';

// 或者
import * as arrayUtils from '@51jbs/core-utils';
```

## API 参考

### unique

数组去重。

**类型签名**
```typescript
function unique<T>(array: T[]): T[]
```

**参数**
- `array` - 原数组

**返回值**
- 去重后的数组

**示例**
```typescript
unique([1, 2, 2, 3, 3, 4]); // [1, 2, 3, 4]
unique(['a', 'b', 'a', 'c']); // ['a', 'b', 'c']
```

---

### uniqueBy

根据指定键去重。

**类型签名**
```typescript
function uniqueBy<T>(array: T[], keyGetter: (item: T) => any): T[]
```

**参数**
- `array` - 原数组
- `keyGetter` - 获取键的函数

**返回值**
- 去重后的数组

**示例**
```typescript
const arr = [
  { id: 1, name: 'a' },
  { id: 2, name: 'b' },
  { id: 1, name: 'c' }
];
uniqueBy(arr, item => item.id);
// [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
```

---

### groupBy

数组分组。

**类型签名**
```typescript
function groupBy<T>(array: T[], keyGetter: (item: T) => string | number): Record<string, T[]>
```

**参数**
- `array` - 原数组
- `keyGetter` - 获取分组键的函数

**返回值**
- 分组后的对象

**示例**
```typescript
const arr = [
  { type: 'fruit', name: 'apple' },
  { type: 'fruit', name: 'banana' },
  { type: 'vegetable', name: 'carrot' }
];
groupBy(arr, item => item.type);
// {
//   fruit: [
//     { type: 'fruit', name: 'apple' },
//     { type: 'fruit', name: 'banana' }
//   ],
//   vegetable: [{ type: 'vegetable', name: 'carrot' }]
// }
```

---

### flatten

数组扁平化。

**类型签名**
```typescript
function flatten<T>(array: any[], depth?: number): T[]
```

**参数**
- `array` - 原数组
- `depth` - 扁平化深度，默认为1

**返回值**
- 扁平化后的数组

**示例**
```typescript
flatten([1, [2, 3], [4, [5]]]); // [1, 2, 3, 4, [5]]
flatten([1, [2, [3, [4]]]], 2); // [1, 2, 3, [4]]
flatten([1, [2, [3, [4]]]], 3); // [1, 2, 3, 4]
```

---

### shuffle

数组乱序（洗牌算法）。

**类型签名**
```typescript
function shuffle<T>(array: T[]): T[]
```

**参数**
- `array` - 原数组

**返回值**
- 乱序后的新数组

**示例**
```typescript
shuffle([1, 2, 3, 4, 5]); // [3, 1, 4, 5, 2]（随机顺序）
```

---

### max

获取数组最大值。

**类型签名**
```typescript
function max(array: number[]): number | undefined
```

**参数**
- `array` - 数字数组

**返回值**
- 最大值，如果数组为空则返回 undefined

**示例**
```typescript
max([1, 5, 3, 9, 2]); // 9
max([]); // undefined
```

---

### min

获取数组最小值。

**类型签名**
```typescript
function min(array: number[]): number | undefined
```

**参数**
- `array` - 数字数组

**返回值**
- 最小值，如果数组为空则返回 undefined

**示例**
```typescript
min([1, 5, 3, 9, 2]); // 1
min([]); // undefined
```

---

### sum

数组求和。

**类型签名**
```typescript
function sum(array: number[]): number
```

**参数**
- `array` - 数字数组

**返回值**
- 总和

**示例**
```typescript
sum([1, 2, 3, 4, 5]); // 15
sum([]); // 0
```

---

### average

数组平均值。

**类型签名**
```typescript
function average(array: number[]): number
```

**参数**
- `array` - 数字数组

**返回值**
- 平均值

**示例**
```typescript
average([1, 2, 3, 4, 5]); // 3
average([]); // 0
```

---

### intersection

数组交集。

**类型签名**
```typescript
function intersection<T>(...arrays: T[][]): T[]
```

**参数**
- `arrays` - 多个数组

**返回值**
- 交集数组

**示例**
```typescript
intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
intersection([1, 2], [3, 4], [5, 6]); // []
```

---

### union

数组并集。

**类型签名**
```typescript
function union<T>(...arrays: T[][]): T[]
```

**参数**
- `arrays` - 多个数组

**返回值**
- 并集数组

**示例**
```typescript
union([1, 2], [2, 3]); // [1, 2, 3]
union([1, 2], [3, 4], [5, 6]); // [1, 2, 3, 4, 5, 6]
```

---

### difference

数组差集（在第一个数组中但不在其他数组中的元素）。

**类型签名**
```typescript
function difference<T>(array: T[], ...arrays: T[][]): T[]
```

**参数**
- `array` - 第一个数组
- `arrays` - 其他数组

**返回值**
- 差集数组

**示例**
```typescript
difference([1, 2, 3], [2, 3, 4]); // [1]
difference([1, 2, 3], [2], [3]); // [1]
```

---

### chunk

数组分块。

**类型签名**
```typescript
function chunk<T>(array: T[], size: number): T[][]
```

**参数**
- `array` - 原数组
- `size` - 每块大小

**返回值**
- 分块后的二维数组

**示例**
```typescript
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]
chunk([1, 2, 3, 4, 5], 3); // [[1, 2, 3], [4, 5]]
```

---

### paginate

数组分页。

**类型签名**
```typescript
function paginate<T>(array: T[], page: number, pageSize: number): {
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number
}
```

**参数**
- `array` - 原数组
- `page` - 页码（从1开始）
- `pageSize` - 每页大小

**返回值**
- 分页数据对象，包含：
  - `data`: 当前页数据
  - `total`: 总数据量
  - `page`: 当前页码
  - `pageSize`: 每页大小
  - `totalPages`: 总页数

**示例**
```typescript
paginate([1, 2, 3, 4, 5, 6, 7], 1, 3);
// {
//   data: [1, 2, 3],
//   total: 7,
//   page: 1,
//   pageSize: 3,
//   totalPages: 3
// }

paginate([1, 2, 3, 4, 5, 6, 7], 2, 3);
// {
//   data: [4, 5, 6],
//   total: 7,
//   page: 2,
//   pageSize: 3,
//   totalPages: 3
// }
```