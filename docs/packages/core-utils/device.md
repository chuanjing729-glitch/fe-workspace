# Device 设备检测工具

Device 模块提供了一系列浏览器环境和设备检测的工具函数，帮助开发者进行环境适配。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用方式

```typescript
import { 
  isMobile, 
  isIOS, 
  isAndroid, 
  isWechat, 
  isWorkWechat,
  isAlipay,
  getBrowserInfo,
  getOS,
  isTouchDevice
} from '@51jbs/core-utils';
```

## API 参考

### isMobile

检查是否为移动端设备。

**源码实现**
<<< @/packages/core-utils/src/device/index.ts{9-12}

**类型签名**
```typescript
function isMobile(): boolean
```

**示例**
```typescript
if (isMobile()) {
  console.log('移动端');
}
```

---

### isIOS

检查是否为 iOS 设备。

**源码实现**
<<< @/packages/core-utils/src/device/index.ts{18-21}

**类型签名**
```typescript
function isIOS(): boolean
```

---

### isAndroid

检查是否为 Android 设备。

**源码实现**
<<< @/packages/core-utils/src/device/index.ts{27-30}

**类型签名**
```typescript
function isAndroid(): boolean
```

---

### isWechat

检查是否为微信内置浏览器。

**源码实现**
<<< @/packages/core-utils/src/device/index.ts{36-39}

**类型签名**
```typescript
function isWechat(): boolean
```

---

### isWorkWechat

检查是否为企业微信内置浏览器。

**源码实现**
<<< @/packages/core-utils/src/device/index.ts{45-48}

**类型签名**
```typescript
function isWorkWechat(): boolean
```

---

### isAlipay

检查是否为支付宝内置浏览器。

**源码实现**
<<< @/packages/core-utils/src/device/index.ts{54-57}

**类型签名**
```typescript
function isAlipay(): boolean
```

---

### getBrowserInfo

获取浏览器名称和版本信息。

**源码实现**
<<< @/packages/core-utils/src/device/index.ts{94-130}

**类型签名**
```typescript
function getBrowserInfo(): { name: string; version: string }
```

**示例**
```typescript
const { name, version } = getBrowserInfo();
console.log(`${name} ${version}`); // "Chrome 120.0"
```

---

### getOS

获取操作系统名称。

**源码实现**
<<< @/packages/core-utils/src/device/index.ts{136-158}

**类型签名**
```typescript
function getOS(): string
```

**示例**
```typescript
console.log(getOS()); // "Windows", "Mac", "iOS", "Android" 等
```

---

### isTouchDevice

检查设备是否支持触摸交互。

**源码实现**
<<< @/packages/core-utils/src/device/index.ts{164-169}

**类型签名**
```typescript
function isTouchDevice(): boolean
```
