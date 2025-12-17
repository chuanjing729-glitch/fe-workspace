# @51jbs/vue2-toolkit

> Vue2 专用工具库，提供统一的消息提示、指令、mixins 等，解决项目中127处消息提示不一致问题

## 📦 安装

```bash
npm install @51jbs/vue2-toolkit
```

## 🚀 快速使用

### 全量引入

```javascript
import Vue from 'vue'
import Vue2Toolkit from '@51jbs/vue2-toolkit'

Vue.use(Vue2Toolkit)
```

### 按需引入

```javascript
import Vue from 'vue'
import { messagePlugin, debounceDirective } from '@51jbs/vue2-toolkit'

// 使用消息提示插件
Vue.use(messagePlugin)

// 注册防抖指令
Vue.directive('debounce', debounceDirective)
```

## 📚 功能列表

### 1. 消息提示插件

**解决问题**：统一项目中127处不一致的消息提示

```javascript
// ✅ 统一方式
this.$message.success('操作成功')
this.$message.error('操作失败')
this.$message.warning('警告信息')
this.$message.info('提示信息')

// ❌ 避免以下不一致的方式
this.$message({ type: 'success', message: '成功' })
this.$message('成功')
```

### 2. 防抖指令

**避免重复点击**

```vue
<template>
  <!-- 默认300ms防抖 -->
  <button v-debounce="handleClick">点击</button>
  
  <!-- 自定义500ms防抖 -->
  <button v-debounce:500="handleClick">点击</button>
</template>

<script>
export default {
  methods: {
    handleClick() {
      console.log('只会执行一次')
    }
  }
}
</script>
```

## 🎯 与现有项目集成

### mall-portal-front 项目

```javascript
// main.js
import Vue2Toolkit from '@51jbs/vue2-toolkit'
Vue.use(Vue2Toolkit)

// 现在可以替换127处消息提示
// 旧代码：this.$message({ type: 'success', message: '成功' })
// 新代码：this.$message.success('成功')
```

## 📝 开发规划

- ✅ 消息提示插件
- ✅ 防抖指令
- 🔲 节流指令
- 🔲 权限指令
- 🔲 表单验证mixin
- 🔲 列表分页mixin

## 📄 License

MIT © 51jbs Frontend Team
