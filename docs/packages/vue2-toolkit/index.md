# Vue2 Toolkit Vue2工具库

`@51jbs/vue2-toolkit` 是专为 Vue2 应用设计的工具库，提供了常用的指令和 Mixins 来提升开发效率。

## 功能模块

### Vue 指令
- **Clipboard**: 剪贴板复制指令 [[文档]](/packages/vue2-toolkit/#clipboard-剪贴板指令)
- **Lazy**: 图片懒加载指令 [[文档]](/packages/vue2-toolkit/#lazy-图片懒加载指令)
- **Permission**: 权限控制指令 [[文档]](/packages/vue2-toolkit/#permission-权限控制指令)
- **Drag**: 拖拽指令 [[文档]](/packages/vue2-toolkit/#drag-拖拽指令)
- **Resize**: 元素大小监听指令 [[文档]](/packages/vue2-toolkit/#resize-元素尺寸变化监听指令)
- **Throttle**: 节流指令 [[文档]](/packages/vue2-toolkit/#throttle-节流指令)
- **Focus**: 自动聚焦指令 [[文档]](/packages/vue2-toolkit/#focus-自动聚焦指令)

### Vue Mixins
- **EventManager**: 事件监听器自动管理 [[文档]](/packages/vue2-toolkit/mixins#eventmanager)
- **PermissionManager**: 权限检查封装 [[文档]](/packages/vue2-toolkit/mixins#permissionmanager)
- **TimerManager**: 定时器自动清理 [[文档]](/packages/vue2-toolkit/mixins#timermanager)
- **ObserverManager**: Observer 生命周期管理 [[文档]](/packages/vue2-toolkit/mixins#observermanager)

## 安装

```bash
npm install @51jbs/vue2-toolkit
```

## 使用

### 全局注册

```javascript
import Vue from 'vue'
import Vue2Toolkit from '@51jbs/vue2-toolkit'

Vue.use(Vue2Toolkit)
```

### 按需引入

```javascript
// 引入特定指令
import { clipboard, lazy } from '@51jbs/vue2-toolkit/directives'

Vue.directive('clipboard', clipboard)
Vue.directive('lazy', lazy)

// 引入 Mixins
import { eventManager } from '@51jbs/vue2-toolkit/mixins'

export default {
  mixins: [eventManager]
}
```

## 特性

### 🔄 自动资源管理
- 事件监听器自动清理
- 定时器自动回收
- Observer 自动断开
- 防止内存泄漏

### 🔐 权限控制
- 细粒度权限检查
- 角色访问控制
- 路由权限守卫

### 🎯 性能优化
- 懒加载减少初始负载
- 节流防抖提升响应性能
- 虚拟滚动支持大数据量

### 🧪 全面测试
- 指令行为完整测试
- Mixins 功能验证
- 边界条件覆盖

## 浏览器兼容性

支持所有 Vue2 兼容的浏览器。

## Changelog

详细的变更历史请查看 [更新日志](/packages/vue2-toolkit/changelog)。
