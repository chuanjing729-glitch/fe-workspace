# Core Utils 核心工具库

`@51jbs/core-utils` 是一个现代化的前端工具库，提供了丰富的工具函数来提升开发效率。

## 功能模块

### 数据处理
- **Array**: 数组操作工具 [[文档]](/fe-workspace/packages/core-utils/array)
- **Object**: 对象操作工具 [[文档]](/fe-workspace/packages/core-utils/#object)
- **String**: 字符串处理工具 [[文档]](/fe-workspace/packages/core-utils/#string)
- **Number**: 数字计算工具 [[文档]](/fe-workspace/packages/core-utils/#number)
- **Date**: 日期处理工具 [[文档]](/fe-workspace/packages/core-utils/#date)

### 格式化工具
- **Format**: 格式化工具 [[文档]](/fe-workspace/packages/core-utils/format)
  - 手机号、金额、日期、文件大小等格式化
  - 银行卡、身份证脱敏处理
  - 百分比、数字千分位格式化

### 事件管理
- **Event**: 事件管理工具 [[文档]](/fe-workspace/packages/core-utils/event)
  - EventBus 发布订阅模式
  - 事件委托和自定义事件
  - Promise 化事件等待

### 网络请求
- **HTTP**: HTTP 客户端 [[文档]](/fe-workspace/packages/core-utils/http)
  - 基于 fetch API 实现
  - 请求/响应拦截器
  - 自动 Token 管理
  - 超时控制和错误处理

### 数据校验
- **Validation**: 数据校验工具 [[文档]](/fe-workspace/packages/core-utils/validation)
  - 手机号、邮箱、身份证校验
  - 密码强度、用户名校验
  - 银行卡号（Luhn算法）校验

### 设备检测
- **Device**: 设备检测工具 [[文档]](/fe-workspace/packages/core-utils/#device)
  - 浏览器类型和版本检测
  - 移动端设备识别
  - 操作系统检测

### 存储管理
- **Storage**: 存储工具 [[文档]](/fe-workspace/packages/core-utils/#storage)
  - LocalStorage 和 SessionStorage 封装
  - Cookie 操作工具
  - 存储加密和压缩

### DOM 操作
- **DOM**: DOM 操作工具 [[文档]](/fe-workspace/packages/core-utils/dom)
  - Class 操作（添加、移除、切换）
  - 滚动位置获取和设置
  - 元素位置计算
  - 视口检测

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用

### 按需引入

```javascript
// 引入特定函数
import { formatPhone, formatDate } from '@51jbs/core-utils'

console.log(formatPhone('13800138000')) // 138****8000
console.log(formatDate(new Date())) // 2024-01-15
```

### 模块引入

```javascript
// 引入模块
import * as format from '@51jbs/core-utils/format'
import * as event from '@51jbs/core-utils/event'

console.log(format.formatCurrency(12345.67)) // ¥12,345.67
const bus = new event.EventBus()
```

## 特性

### 🚀 高性能
- 基于现代 JavaScript 实现
- 无外部依赖，体积小巧
- 支持 Tree Shaking

### 🛡️ 类型安全
- 完整的 TypeScript 类型定义
- 编译时类型检查
- 智能代码提示

### 🧪 全面测试
- 100% 测试覆盖率
- 单元测试和集成测试
- 自动化 CI/CD 测试

### 📦 模块化
- 按功能模块划分
- 支持按需引入
- 易于扩展和维护

## 浏览器兼容性

支持所有现代浏览器（Chrome、Firefox、Safari、Edge）。

## Changelog

详细的变更历史请查看 [更新日志](/fe-workspace/packages/core-utils/changelog)。
