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

### isEmail(value: string): boolean

校验是否为有效的邮箱地址。

**参数:**
- `value`: 待校验的字符串

**返回值:**
- 如果是有效邮箱地址返回 true，否则返回 false

**示例:**
```typescript
isEmail('test@example.com'); // true
isEmail('invalid-email'); // false
```

### isMobile(value: string): boolean

校验是否为有效的中国大陆手机号码。

**参数:**
- `value`: 待校验的字符串

**返回值:**
- 如果是有效手机号码返回 true，否则返回 false

**示例:**
```typescript
isMobile('13812345678'); // true
isMobile('12345678901'); // false
```

### isIdCard(value: string): boolean

校验是否为有效的中国大陆身份证号码。

**参数:**
- `value`: 待校验的字符串

**返回值:**
- 如果是有效身份证号码返回 true，否则返回 false

**示例:**
```typescript
isIdCard('110101199001011234'); // true
isIdCard('invalid-id-card'); // false
```

### isUrl(value: string): boolean

校验是否为有效的 URL 地址。

**参数:**
- `value`: 待校验的字符串

**返回值:**
- 如果是有效 URL 返回 true，否则返回 false

**示例:**
```typescript
isUrl('https://www.example.com'); // true
isUrl('invalid-url'); // false
```

### isIP(value: string): boolean

校验是否为有效的 IPv4 地址。

**参数:**
- `value`: 待校验的字符串

**返回值:**
- 如果是有效 IPv4 地址返回 true，否则返回 false

**示例:**
```typescript
isIP('192.168.1.1'); // true
isIP('invalid-ip'); // false
```

### isPostalCode(value: string): boolean

校验是否为有效的中国邮政编码。

**参数:**
- `value`: 待校验的字符串

**返回值:**
- 如果是有效邮政编码返回 true，否则返回 false

**示例:**
```typescript
isPostalCode('100000'); // true
isPostalCode('12345'); // false
```

### isQQ(value: string): boolean

校验是否为有效的 QQ 号码。

**参数:**
- `value`: 待校验的字符串

**返回值:**
- 如果是有效 QQ 号码返回 true，否则返回 false

**示例:**
```typescript
isQQ('123456789'); // true
isQQ('abc123'); // false
```

### isWechat(value: string): boolean

校验是否为有效的微信号。

**参数:**
- `value`: 待校验的字符串

**返回值:**
- 如果是有效微信号返回 true，否则返回 false

**示例:**
```typescript
isWechat('wechat123'); // true
isWechat('123'); // false (微信号不能纯数字且长度至少6位)
```

### isPlateNumber(value: string): boolean

校验是否为有效的中国车牌号。

**参数:**
- `value`: 待校验的字符串

**返回值:**
- 如果是有效车牌号返回 true，否则返回 false

**示例:**
```typescript
isPlateNumber('沪A12345'); // true
isPlateNumber('invalid-plate'); // false
```

### isBankCard(value: string): boolean

校验是否为有效的银行卡号。

**参数:**
- `value`: 待校验的字符串

**返回值:**
- 如果是有效银行卡号返回 true，否则返回 false

**示例:**
```typescript
isBankCard('6222021234567890123'); // true
isBankCard('invalid-card'); // false
```

### isEmpty(value: any): boolean

校验值是否为空（null、undefined、空字符串、空数组、空对象）。

**参数:**
- `value`: 待校验的值

**返回值:**
- 如果值为空返回 true，否则返回 false

**示例:**
```typescript
isEmpty(null); // true
isEmpty(''); // true
isEmpty([]); // true
isEmpty({}); // true
isEmpty('hello'); // false
```

### isNotEmpty(value: any): boolean

校验值是否不为空（与 isEmpty 相反）。

**参数:**
- `value`: 待校验的值

**返回值:**
- 如果值不为空返回 true，否则返回 false

**示例:**
```typescript
isNotEmpty('hello'); // true
isNotEmpty(null); // false
```