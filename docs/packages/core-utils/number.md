# Number 数字精确计算

数字模块提供了解决 JavaScript 浮点数精度问题的精确计算函数，以及数字格式化、范围限制等常用工具。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用方式

```typescript
import { add, subtract, multiply, divide, formatNumber, clamp } from '@51jbs/core-utils';
```

## API 参考

### add

精确加法，解决 `0.1 + 0.2 !== 0.3` 的问题。

**源码实现**
<<< @/packages/core-utils/src/number/index.ts{9-14}

**类型签名**
```typescript
function add(num1: number, num2: number): number
```

**示例**
```typescript
add(0.1, 0.2); // 0.3
```

---

### subtract

精确减法。

**源码实现**
<<< @/packages/core-utils/src/number/index.ts{19-24}

**类型签名**
```typescript
function subtract(num1: number, num2: number): number
```

**示例**
```typescript
subtract(1.5, 1.2); // 0.3
```

---

### multiply

精确乘法。

**源码实现**
<<< @/packages/core-utils/src/number/index.ts{29-34}

**类型签名**
```typescript
function multiply(num1: number, num2: number): number
```

**示例**
```typescript
multiply(0.2, 0.1); // 0.02
```

---

### divide

精确除法。

**源码实现**
<<< @/packages/core-utils/src/number/index.ts{39-46}

**类型签名**
```typescript
function divide(num1: number, num2: number): number
```

**参数**
- `num1` - 被除数
- `num2` - 除数（不能为 0）

---

### formatNumber

格式化数字（千分位）。

**源码实现**
<<< @/packages/core-utils/src/number/index.ts{60-64}

**示例**
```typescript
formatNumber(123456.789); // "123,456.79"
```

---

### toFixed

安全地保留小数位。

**源码实现**
<<< @/packages/core-utils/src/number/index.ts{76-78}

**示例**
```typescript
toFixed(1.235, 2); // 1.24
```

---

### clamp

数字范围限制（限制在 [min, max] 之间）。

**源码实现**
<<< @/packages/core-utils/src/number/index.ts{106-112}

**示例**
```typescript
clamp(10, 0, 5); // 5
clamp(-1, 0, 5); // 0
clamp(3, 0, 5); // 3
```

---

### randomInt

生成指定范围内的随机整数。

**源码实现**
<<< @/packages/core-utils/src/number/index.ts{117-122}

**示例**
```typescript
randomInt(1, 10); // 返回 1 到 10 之间的随机整数
```

---

### numberToChinese

数字转中文大写（支持整数和小数）。

**源码实现**
<<< @/packages/core-utils/src/number/index.ts{127-173}

**示例**
```typescript
numberToChinese(12345.67); // "壹万贰仟叁佰肆拾伍点陆柒"
```
