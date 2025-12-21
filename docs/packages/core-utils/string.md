# String 字符串处理工具

字符串模块提供了一系列处理 JavaScript 字符串的函数，包括脱敏、格式转换、验证、截断和字节长度计算等。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用方式

```typescript
import { maskPhone, maskIdCard, capitalize, camelToSnake, truncate, uuid } from '@51jbs/core-utils';
```

## API 参考

### maskPhone

手机号脱敏（隐藏中间 4 位）。

**源码实现**
<<< @/packages/core-utils/src/string/index.ts{8-13}

**示例**
```typescript
maskPhone('13800138000'); // "138****8000"
```

---

### maskIdCard

身份证脱敏（隐藏中间部分，支持 15/18 位）。

**源码实现**
<<< @/packages/core-utils/src/string/index.ts{18-23}

**示例**
```typescript
maskIdCard('110101199001011234'); // "110101********1234"
```

---

### maskEmail

邮箱脱敏。

**源码实现**
<<< @/packages/core-utils/src/string/index.ts{28-37}

**示例**
```typescript
maskEmail('test@example.com'); // "t***t@example.com"
```

---

### capitalize

首字母大写。

**源码实现**
<<< @/packages/core-utils/src/string/index.ts{49-52}

---

### camelToSnake

驼峰命名转下划线命名。

**源码实现**
<<< @/packages/core-utils/src/string/index.ts{57-59}

---

### snakeToCamel

下划线命名转驼峰命名。

**源码实现**
<<< @/packages/core-utils/src/string/index.ts{64-66}

---

### truncate

按字符数截断字符串。

**源码实现**
<<< @/packages/core-utils/src/string/index.ts{71-76}

---

### getByteLength

获取字符串字节长度（中文占 2 字节，英文占 1 字节）。

**源码实现**
<<< @/packages/core-utils/src/string/index.ts{165-177}

---

### uuid

生成随机 UUID。

**源码实现**
<<< @/packages/core-utils/src/string/index.ts{207-213}
