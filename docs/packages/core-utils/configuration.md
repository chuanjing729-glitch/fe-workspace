# 配置选项

core-utils 支持全局配置和模块配置，可以通过配置来定制库的行为。

## 全局配置

### debug
- 类型: `boolean`
- 默认值: `false`
- 说明: 是否开启调试模式，开启后会在控制台输出更多的调试信息

### cacheEnabled
- 类型: `boolean`
- 默认值: `true`
- 说明: 是否开启缓存机制，对于一些计算密集型函数可以缓存结果以提高性能

### timeout
- 类型: `number`
- 默认值: `5000`
- 说明: HTTP 请求的默认超时时间（毫秒）

## 模块配置

### dateFormat
- 类型: `string`
- 默认值: `'YYYY-MM-DD'`
- 说明: 默认日期格式，用于日期相关的函数

### domPrefix
- 类型: `string`
- 默认值: `''`
- 说明: DOM 操作的前缀，用于避免 CSS 类名冲突

### validatorMessages
- 类型: `object`
- 默认值: `{}`
- 说明: 验证器错误信息配置，可以自定义验证失败时的错误消息

## 配置方式

### 1. 通过环境变量配置

```javascript
// 在应用启动时设置全局配置
window.__CORE_UTILS_CONFIG__ = {
  debug: true,
  cacheEnabled: false,
  timeout: 10000
};
```

### 2. 通过函数配置

部分模块支持通过函数参数传递配置：

```javascript
import { formatDate } from '@51jbs/core-utils';

// 使用自定义日期格式
formatDate(new Date(), 'YYYY/MM/DD');
```

### 3. 通过初始化配置

对于支持配置的模块，可以通过初始化时传入配置对象：

```javascript
import { createHttpClient } from '@51jbs/core-utils';

// 创建带有自定义配置的 HTTP 客户端
const client = createHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 8000
});
```

## 配置优先级

配置的优先级从高到低依次为：

1. 函数调用时传入的参数配置
2. 模块初始化时的配置
3. 全局环境变量配置
4. 默认配置

## 最佳实践

1. **生产环境配置**：
   ```javascript
   // 生产环境建议关闭调试模式并启用缓存
   window.__CORE_UTILS_CONFIG__ = {
     debug: false,
     cacheEnabled: true,
     timeout: 5000
   };
   ```

2. **开发环境配置**：
   ```javascript
   // 开发环境可以开启调试模式以便排查问题
   window.__CORE_UTILS_CONFIG__ = {
     debug: true,
     cacheEnabled: false,  // 开发时可能需要禁用缓存以便测试
     timeout: 10000  // 开发环境可以适当增加超时时间
   };
   ```

3. **按需配置**：
   不建议一次性配置所有选项，只需配置需要修改的选项即可，其他将使用默认值。