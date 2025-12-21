# Format 格式化工具

格式化工具模块提供了常用的数据格式化函数，包括手机号、金额、日期、文件大小等。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用

```typescript
import { 
  formatPhone, 
  formatCurrency, 
  formatDate,
  formatFileSize,
  formatBankCard,
  formatIdCard,
  formatPercent,
  formatNumber
} from '@51jbs/core-utils'
```

## API

### formatPhone

格式化手机号（隐藏中间4位）

**源码实现**
<<< @/packages/core-utils/src/format/index.ts{13-18}

**示例 (源自测试用例)**
<<< @/packages/core-utils/tests/format.test.ts#example-phone

---

### formatCurrency

格式化金额（千分位+货币符号）

**源码实现**
<<< @/packages/core-utils/src/format/index.ts{27-39}

**示例**
```typescript
import { formatCurrency } from '@51jbs/core-utils'

formatCurrency(12345.67) // '¥12,345.67'
formatCurrency('', 2, '¥', 'N/A') // 'N/A'
```

---

### formatDate

格式化日期

**类型签名**
```typescript
function formatDate(
  date: string | Date, 
  format?: string
): string
```

**参数**
- `date` - 日期对象或字符串
- `format` - 格式化模板，默认`'YYYY-MM-DD'`
  - `YYYY` - 4位年份
  - `MM` - 2位月份
  - `DD` - 2位日期
  - `HH` - 2位小时
  - `mm` - 2位分钟
  - `ss` - 2位秒

**返回值**
- 格式化后的日期字符串

**示例**
```typescript
const date = new Date('2024-01-15T10:30:45')

formatDate(date) // '2024-01-15'
formatDate(date, 'YYYY-MM-DD HH:mm:ss') // '2024-01-15 10:30:45'
formatDate(date, 'YYYY/MM/DD') // '2024/01/15'
formatDate(date, 'MM-DD HH:mm') // '01-15 10:30'
```

---

### formatFileSize

格式化文件大小

**类型签名**
```typescript
function formatFileSize(
  bytes: number, 
  decimals?: number
): string
```

**参数**
- `bytes` - 字节数
- `decimals` - 小数位数，默认`2`

**返回值**
- 格式化后的文件大小字符串（自动单位转换）

**示例**
```typescript
formatFileSize(0) // '0 Bytes'
formatFileSize(1024) // '1.00 KB'
formatFileSize(1536) // '1.50 KB'
formatFileSize(1024 * 1024) // '1.00 MB'
formatFileSize(1024 * 1024 * 1024, 0) // '1 GB'
```

---

### formatBankCard

格式化银行卡号（每4位添加空格）

**类型签名**
```typescript
function formatBankCard(cardNumber: string): string
```

**参数**
- `cardNumber` - 银行卡号

**返回值**
- 格式化后的银行卡号

**示例**
```typescript
formatBankCard('6222021234567890') // '6222 0212 3456 7890'
formatBankCard('6222 0212 3456 7890') // '6222 0212 3456 7890'（已有空格保持不变）
```

---

### formatIdCard

格式化身份证号（隐藏中间部分）

**类型签名**
```typescript
function formatIdCard(idCard: string): string
```

**参数**
- `idCard` - 身份证号（支持15位或18位）

**返回值**
- 格式化后的身份证号

**示例**
```typescript
formatIdCard('110101199001011234') // '110101********1234'（18位）
formatIdCard('110101900101123') // '110101******123'（15位）
```

---

### formatPercent

格式化百分比

**类型签名**
```typescript
function formatPercent(
  value: number, 
  decimals?: number,
  isDecimal?: boolean
): string
```

**参数**
- `value` - 数值
- `decimals` - 小数位数，默认`2`
- `isDecimal` - 是否为小数形式（0-1），默认`true`

**返回值**
- 格式化后的百分比字符串

**示例**
```typescript
formatPercent(0.123) // '12.30%'
formatPercent(0.5) // '50.00%'
formatPercent(50, 2, false) // '50.00%'（整数形式）
formatPercent(0.12345, 0) // '12%'
```

---

### formatNumber

格式化数字（千分位）

**类型签名**
```typescript
function formatNumber(
  num: number | string, 
  decimals?: number
): string
```

**参数**
- `num` - 数值或字符串
- `decimals` - 小数位数（可选）

**返回值**
- 格式化后的数字字符串

**示例**
```typescript
formatNumber(12345) // '12,345'
formatNumber(1234567) // '1,234,567'
formatNumber(12345.67) // '12,345.67'
formatNumber(12345.67, 1) // '12,345.7'
formatNumber(12345.67, 0) // '12,346'
```

## 最佳实践

### 1. 表单显示

```typescript
// 用户信息展示
const userInfo = {
  phone: formatPhone('13800138000'),
  idCard: formatIdCard('110101199001011234'),
  balance: formatCurrency(12345.67)
}
```

### 2. 列表渲染

```vue
<template>
  <div>
    <p>金额：{{ formatCurrency(amount) }}</p>
    <p>文件大小：{{ formatFileSize(fileSize) }}</p>
    <p>更新时间：{{ formatDate(updateTime, 'YYYY-MM-DD HH:mm') }}</p>
  </div>
</template>

<script>
import { formatCurrency, formatFileSize, formatDate } from '@51jbs/core-utils'

export default {
  data() {
    return {
      amount: 12345.67,
      fileSize: 1024000,
      updateTime: new Date()
    }
  },
  methods: {
    formatCurrency,
    formatFileSize,
    formatDate
  }
}
</script>
```

### 3. 敏感信息脱敏

```typescript
// 安全显示敏感信息
const userProfile = {
  phone: formatPhone(user.phone),      // 138****8000
  idCard: formatIdCard(user.idCard),   // 110101********1234
  bankCard: formatBankCard(user.card)  // 6222 **** **** 7890
}
```

## Changelog

| 版本 | 变更内容 | 修改人 | 日期 |
|------|---------|--------|------|
| 1.0.0 | 初始版本，新增8个格式化函数 | Chuanjing Li | 2024-12-15 |
