# Date 日期处理工具

日期模块提供了一系列处理 JavaScript Date 对象的函数，包括计算差值、获取相对时间、判断特殊日期等。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用方式

```typescript
import { dateDiff, getRelativeTime, isToday, isWorkday, addDays } from '@51jbs/core-utils';
```

## API 参考

### dateDiff

计算两个日期之间的天数差。

**源码实现**
<<< @/packages/core-utils/src/date/index.ts{36-40}

**类型签名**
```typescript
function dateDiff(date1: Date | number | string, date2: Date | number | string): number
```

**示例**
```typescript
dateDiff('2025-12-01', '2025-12-15'); // 14
```

---

### getRelativeTime

获取相对于当前时间的自然语言描述（如 "1分钟前"、"2天前"）。

**源码实现**
<<< @/packages/core-utils/src/date/index.ts{45-72}

**示例**
```typescript
getRelativeTime(Date.now() - 60000); // "1分钟前"
getRelativeTime('2023-01-01'); // "2年前" (取决于当前日期)
```

---

### isToday

判断给定日期是否为今天。

**源码实现**
<<< @/packages/core-utils/src/date/index.ts{77-83}

---

### isWorkday

判断是否为工作日（周一至周五）。

**源码实现**
<<< @/packages/core-utils/src/date/index.ts{88-92}

---

### getDaysInMonth

获取指定月份的天数。

**源码实现**
<<< @/packages/core-utils/src/date/index.ts{97-99}

---

### addDays

在给定日期基础上增加天数。

**源码实现**
<<< @/packages/core-utils/src/date/index.ts{104-108}

---

### addMonths

在给定日期基础上增加月数。

**源码实现**
<<< @/packages/core-utils/src/date/index.ts{113-117}
