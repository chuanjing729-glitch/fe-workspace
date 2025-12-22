---
title: vue2-toolkit
order: 1
editLink: true
---

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

### 3. 节流指令

**控制高频事件触发频率**

```vue
<template>
  <!-- 监听滚动事件，300ms节流 -->
  <div v-throttle:scroll="handleScroll">内容区域</div>
  
  <!-- 自定义节流时间 -->
  <div v-throttle:scroll="[handleScroll, 500]">内容区域</div>
</template>

<script>
export default {
  methods: {
    handleScroll() {
      console.log('滚动事件被节流处理')
    }
  }
}
</script>
```

### 4. 剪贴板指令

**一键复制文本内容**

```vue
<template>
  <!-- 复制静态文本 -->
  <button v-clipboard="'复制的文本内容'" @success="onCopySuccess" @error="onCopyError">
    复制
  </button>
  
  <!-- 复制动态文本 -->
  <button v-clipboard="dynamicText" @success="onCopySuccess">
    复制动态内容
  </button>
</template>

<script>
export default {
  data() {
    return {
      dynamicText: '这是动态文本内容'
    }
  },
  methods: {
    onCopySuccess() {
      this.$message.success('复制成功')
    },
    onCopyError() {
      this.$message.error('复制失败')
    }
  }
}
</script>
```

### 5. 权限控制指令

**基于用户权限控制元素显示**

```vue
<template>
  <!-- 单个权限控制 -->
  <button v-permission="'admin'">管理员按钮</button>
  
  <!-- 多个权限控制（满足任一即可） -->
  <button v-permission="['admin', 'editor']">编辑按钮</button>
</template>

<script>
export default {
  // 在Vue实例中设置用户权限
  created() {
    this.$permissions = ['admin', 'user']
  }
}
</script>
```

### 6. 懒加载指令

**图片懒加载优化性能**

```vue
<template>
  <!-- 图片懒加载 -->
  <img v-lazy="imageUrl" alt="懒加载图片">
</template>

<script>
export default {
  data() {
    return {
      imageUrl: 'https://example.com/image.jpg'
    }
  }
}
</script>
```

### 7. 自动聚焦指令

**自动聚焦输入框等元素**

```vue
<template>
  <!-- 页面加载后自动聚焦 -->
  <input v-focus placeholder="请输入内容">
  
  <!-- 条件性聚焦 -->
  <input v-focus="shouldFocus" placeholder="条件性聚焦">
</template>

<script>
export default {
  data() {
    return {
      shouldFocus: true
    }
  }
}
</script>
```

### 8. 拖拽指令

**简单拖拽功能**

```vue
<template>
  <!-- 可拖拽的对话框 -->
  <div v-drag class="dialog">
    可拖拽的对话框
  </div>
</template>

<style>
.dialog {
  position: absolute;
  width: 300px;
  height: 200px;
  border: 1px solid #ccc;
  background: white;
}
</style>
```

### 9. 尺寸监听指令

**监听元素尺寸变化**

```vue
<template>
  <div v-resize="handleResize">
    尺寸变化监听区域
  </div>
</template>

<script>
export default {
  methods: {
    handleResize(size) {
      console.log('元素尺寸变化:', size.width, size.height)
    }
  }
}
</script>
```

## 🧩 Mixins（混合）

### 1. 事件管理 Mixin

**自动管理事件监听器，防止内存泄漏**

```javascript
import { eventManager } from '@51jbs/vue2-toolkit'

export default {
  mixins: [eventManager],
  mounted() {
    // 添加 DOM 事件监听器
    this.$_addEventListener(window, 'resize', this.handleWindowResize)
    
    // 添加 Vue 事件监听器
    this.$_on(this.$bus, 'custom-event', this.handleCustomEvent)
  },
  methods: {
    handleWindowResize() {
      console.log('窗口尺寸变化')
    },
    handleCustomEvent(data) {
      console.log('自定义事件:', data)
    }
  }
}
```

### 2. 定时器管理 Mixin

**自动管理定时器，防止内存泄漏**

```javascript
import { timerManager } from '@51jbs/vue2-toolkit'

export default {
  mixins: [timerManager],
  mounted() {
    // 创建定时器
    this.timerId = this.$_setTimeout(() => {
      console.log('延时执行')
    }, 1000)
    
    // 创建周期性定时器
    this.intervalId = this.$_setInterval(() => {
      console.log('周期性执行')
    }, 2000)
  },
  beforeDestroy() {
    // 定时器会在 mixin 中自动清理，无需手动处理
  }
}
```

### 3. 权限管理 Mixin

**便捷的权限检查功能**

```javascript
import { permissionManager } from '@51jbs/vue2-toolkit'

export default {
  mixins: [permissionManager],
  methods: {
    handleClick() {
      // 检查权限
      if (this.$_hasPermission('edit')) {
        // 有编辑权限
        this.editItem()
      } else {
        // 无权限提示
        this.$message.warning('您没有编辑权限')
      }
    },
    
    // 权限检查装饰器
    handleDelete() {
      this.$_checkPermission('delete', () => {
        // 有权限时执行
        this.deleteItem()
      }, () => {
        // 无权限时执行
        this.$message.warning('您没有删除权限')
      })
    }
  }
}
```

### 4. Observer 管理 Mixin

**自动管理各种 Observer，防止内存泄漏**

```javascript
import { observerManager } from '@51jbs/vue2-toolkit'

export default {
  mixins: [observerManager],
  mounted() {
    // 创建尺寸监听器
    this.$_createResizeObserver(this.$el, (entries) => {
      console.log('元素尺寸变化:', entries[0].contentRect)
    })
    
    // 创建交叉观察器
    this.$_createIntersectionObserver(this.$el, (entries) => {
      console.log('元素可见性变化:', entries[0].isIntersecting)
    })
  }
}
```

## 🎯 解决的问题

| 问题 | 解决方案 |
|------|---------|
| **127处消息提示不一致** | `messagePlugin` 统一消息提示方式 |
| **重复点击导致重复请求** | `v-debounce` 防抖指令 |
| **高频事件性能问题** | `v-throttle` 节流指令 |
| **手动管理事件监听器** | `eventManager` mixin 自动清理 |
| **定时器内存泄漏** | `timerManager` mixin 自动清理 |
| **权限控制代码重复** | `v-permission` 指令和 `permissionManager` mixin |
| **图片加载性能问题** | `v-lazy` 懒加载指令 |
| **Observer 管理复杂** | `observerManager` mixin 自动清理 |

## 📊 功能统计

- **9个指令**（防抖、节流、剪贴板、权限、懒加载、聚焦、拖拽、尺寸监听）
- **4个Mixins**（事件管理、定时器管理、权限管理、Observer管理）
- **1个插件**（消息提示）
- **500+行**源码

## 📄 License

MIT © Chuanjing Li