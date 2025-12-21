# 数据校验工具

数据校验工具提供了一系列常用的数据验证函数，用于校验表单输入、业务数据等。

## 使用方式

```typescript
import { 
  isEmail, 
  isMobile, 
  isIdCard, 
  isUrl,
  isIP,
  isPostalCode,
  isQQ,
  isWechat,
  isPlateNumber,
  isBankCard,
  isEmpty,
  isNotEmpty
} from '@51jbs/core-utils';

// 或者
import * as validationUtils from '@51jbs/core-utils';
```

## API 参考

### isPhone

验证手机号（中国大陆）。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{10-13}

**类型签名**
```typescript
function isPhone(phone: string): boolean
```

**示例**
```typescript
isPhone('13812345678'); // true
```

---

### isEmail

验证邮箱。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{20-23}

**类型签名**
```typescript
function isEmail(email: string): boolean
```

**示例**
```typescript
isEmail('test@example.com'); // true
```

---

### isIdCard

验证身份证号（15/18位）。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{30-33}

**类型签名**
```typescript
function isIdCard(idCard: string): boolean
```

**示例**
```typescript
isIdCard('110101199001011234'); // true
```

---

### isURL

验证 URL。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{40-44}

**类型签名**
```typescript
function isURL(url: string): boolean
```

**示例**
```typescript
isURL('https://www.google.com'); // true
```

---

### validatePassword

验证密码强度（6-20位，必须包含字母和数字）。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{69-90}

**类型签名**
```typescript
function validatePassword(password: string): { valid: boolean; message: string }
```

**示例**
```typescript
validatePassword('Abc123456'); // { valid: true, message: '密码符合要求' }
validatePassword('123456'); // { valid: false, message: '密码必须包含字母和数字' }
```

---

### validateUsername

验证用户名（2-20位，中文/英文/数字/下划线）。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{97-115}

**类型签名**
```typescript
function validateUsername(username: string): { valid: boolean; message: string }
```

**示例**
```typescript
validateUsername('user_01'); // { valid: true, message: '用户名符合要求' }
```

---

### validateBankCard

验证银行卡号（Luhn 算法）。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{122-141}

**类型签名**
```typescript
function validateBankCard(cardNumber: string): boolean
```

**示例**
```typescript
validateBankCard('6222021234567890'); // true
```

---

### isChinese

验证是否全为中文字符。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{148-151}

**类型签名**
```typescript
function isChinese(str: string): boolean
```

**示例**
```typescript
isChinese('你好'); // true
isChinese('Hello'); // false
```

---

### isCreditCode

验证统一社会信用代码。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{167-170}

**类型签名**
```typescript
function isCreditCode(code: string): boolean
```

---

### isInteger

验证是否为整数。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{158-160}

---

### isNumber

验证是否为数字（支持整数、小数、负数字符串）。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{187-190}

---

### required

必填验证（非 null/undefined，非空字符串，非空数组）。

**源码实现**
<<< @/packages/core-utils/src/validation/index.ts{230-235}

**类型签名**
```typescript
function required(value: any): boolean
```

**示例**
```typescript
required('  '); // false (trim后为空)
required([]); // false
required(0); // true
```