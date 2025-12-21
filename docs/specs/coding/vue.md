# Vue 开发规范

## 组件设计原则

### 单一职责原则
```vue
<!-- ❌ 错误：一个组件承担过多职责 -->
<template>
  <div>
    <user-form />
    <user-list />
    <user-statistics />
  </div>
</template>

<!-- ✅ 正确：职责分离 -->
<!-- UserManagement.vue -->
<template>
  <div class="user-management">
    <user-search @search="handleSearch" />
    <user-list :users="users" />
    <user-dialog v-model="showDialog" />
  </div>
</template>
```

### 组件大小控制
```bash
# 规则：单个组件不超过 300 行代码（含模板和脚本）
# 如果超过，考虑拆分为子组件或使用 mixin
```

## Props 规范

```vue
<script>
export default {
  name: 'UserCard',
  props: {
    // ✅ 完整的 prop 定义
    user: {
      type: Object,
      required: true,
      validator(value) {
        return value && value.id && value.name
      }
    },
    
    // ✅ 带默认值的 prop
    size: {
      type: String,
      default: 'medium',
      validator(value) {
        return ['small', 'medium', 'large'].includes(value)
      }
    },
    
    // ✅ 数组/对象默认值使用工厂函数
    tags: {
      type: Array,
      default: () => []
    },
    
    options: {
      type: Object,
      default: () => ({
        showAvatar: true,
        showBadge: false
      })
    }
  },
  
  // ❌ 禁止直接修改 prop
  methods: {
    updateUser() {
      // this.user.name = 'new name'  // ❌ 错误
      
      // ✅ 正确：emit 事件或使用本地副本
      this.$emit('update:user', { ...this.user, name: 'new name' })
    }
  }
}
</script>
```

## 事件规范

```vue
<script>
export default {
  name: 'UserForm',
  methods: {
    // ✅ 推荐：使用明确的事件名
    handleSubmit() {
      this.$emit('submit', this.formData)          // 动作事件
      this.$emit('update:user', this.formData)     // 更新事件（支持.sync）
      this.$emit('change', this.formData)          // 变化事件
    },
    
    // ❌ 禁止：模糊的事件名
    handleClick() {
      // this.$emit('click')     // 过于通用
      // this.$emit('action')    // 不明确
    }
  }
}
</script>

<!-- 使用时 -->
<template>
  <!-- ✅ .sync 修饰符 -->
  <user-form :user.sync="userData" @submit="handleSubmit" />
  
  <!-- 等价于 -->
  <user-form 
    :user="userData" 
    @update:user="val => userData = val"
    @submit="handleSubmit" 
  />
</template>
```

## 生命周期使用规范

```vue
<script>
export default {
  name: 'ComponentLifecycle',
  
  // ⭐ 正确的生命周期拼写（严格检查）
  created() {
    // 初始化数据、设置监听
    this.initData()
  },
  
  mounted() {
    // DOM 操作、第三方库初始化、事件监听
    this.initEventListeners()
    this.initChart()
  },
  
  // ⭐ 必须正确拼写（不是 beforedestory）
  beforeDestroy() {
    // ⭐ 关键：清理所有资源
    this.cleanup()
  },
  
  destroyed() {
    // 额外的清理工作
  },
  
  methods: {
    initEventListeners() {
      // ✅ 保存事件处理器引用
      this.handleResize = () => {
        this.updateLayout()
      }
      window.addEventListener('resize', this.handleResize)
    },
    
    cleanup() {
      // ⭐ 清理事件监听器
      if (this.handleResize) {
        window.removeEventListener('resize', this.handleResize)
      }
      
      // ⭐ 清理定时器
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      
      // ⭐ 清理 EventBus
      if (this.eventBusHandler) {
        window.eventBus.$off('update', this.eventBusHandler)
      }
      
      // ⭐ 清理 Observer
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }
    }
  }
}
</script>

---

## 高阶进阶：自动化与微前端适配 (Advanced)

针对复杂应用场景，推荐引入 `@51jbs/vue2-toolkit` 提供的 Mixins 以简化开发并确保质量。

### 1. 自动资源回收 (AutoCleanup)

**库地址**：`@51jbs/vue2-toolkit/mixins`

无需手动编写 `beforeDestroy` 清理逻辑，一键预防内存泄漏。

```vue
<script>
import { AutoCleanup } from '@51jbs/vue2-toolkit'

export default {
  mixins: [AutoCleanup],
  mounted() {
    // 所有的定时器、全局监听器将会在组件销毁时被 Mixin 自动清理
    this.$_timers.push(setInterval(() => {
      console.log('Safe Timer')
    }, 1000))
  }
}
</script>
```

### 2. 微前端环境适配 (MicroAdapter)

**库地址**：`@51jbs/vue2-toolkit/mixins`

专门用于 `qiankun` 环境，提供标准化的全局状态同步能力。

```vue
<script>
import { MicroAdapter } from '@51jbs/vue2-toolkit'

export default {
  mixins: [MicroAdapter],
  data() {
    return {
      // ✅ 混入自动提供 $_isMicroApp 判定
    }
  },
  mounted() {
    if (this.$_isMicroApp) {
      console.log('Running in Micro Sandbox')
      // 使用 $_setMicroState 与主应用同步状态
      this.$_setMicroState({ user: 'chuanjing' })
    }
  }
}
</script>
```
```