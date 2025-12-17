# Mixins 资源管理

Vue2 Mixins 提供了自动资源管理功能，防止内存泄漏，包括事件监听器、定时器、Observer等。

## 安装

```bash
npm install @51jbs/vue2-toolkit
```

## Mixins 列表

- **eventManager** - 事件监听器自动管理
- **permissionManager** - 权限检查封装
- **timerManager** - 定时器自动清理
- **observerManager** - Observer生命周期管理

---

## eventManager

自动管理事件监听器的添加和移除，防止内存泄漏。

### 使用

```javascript
import { eventManager } from '@51jbs/vue2-toolkit'

export default {
  mixins: [eventManager],
  
  mounted() {
    // 使用 $_addEventListener 代替 addEventListener
    this.$_addEventListener(window, 'resize', this.handleResize)
  
    // 使用 $_on 代替 $on
    this.$_on(this.$bus, 'custom-event', this.handleCustom)
  }
  
  // beforeDestroy 自动清理所有事件监听器
}
```

### API

#### $_addEventListener

添加 DOM 事件监听器

```javascript
$_addEventListener(target, event, handler, options)
```

**参数**

- `target` - 事件目标（window、document、DOM元素）
- `event` - 事件名
- `handler` - 处理函数
- `options` - 事件选项（可选）

#### $_on

添加 Vue 事件监听器

```javascript
$_on(bus, event, handler)
```

**参数**

- `bus` - 事件总线（Vue实例）
- `event` - 事件名
- `handler` - 处理函数

#### $_off

移除 Vue 事件监听器

```javascript
$_off(bus, event, handler)
```

#### $_removeEventListener

移除 DOM 事件监听器

```javascript
$_removeEventListener(target, event, handler)
```

#### $_clearAllListeners

清除所有事件监听器

```javascript
$_clearAllListeners()
```

### 示例

```javascript
export default {
  mixins: [eventManager],
  
  data() {
    return {
      windowWidth: window.innerWidth
    }
  },
  
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
    },
  
    handleScroll() {
      console.log('scrolling...')
    }
  },
  
  mounted() {
    // 监听窗口大小变化
    this.$_addEventListener(window, 'resize', this.handleResize)
  
    // 监听滚动
    this.$_addEventListener(document, 'scroll', this.handleScroll, {
      passive: true
    })
  
    // 监听自定义事件
    this.$_on(this.$root, 'notification', this.showNotification)
  }
  
  // 组件销毁时自动清理所有监听器
}
```

---

## permissionManager

权限检查封装，简化权限判断逻辑。

### 使用

```javascript
import { permissionManager } from '@51jbs/vue2-toolkit'

export default {
  mixins: [permissionManager],
  
  computed: {
    canEdit() {
      return this.$_hasPermission('article:edit')
    },
  
    canDelete() {
      return this.$_hasRole('admin')
    }
  }
}
```

### API

#### $_userPermissions

当前用户权限列表（computed）

```javascript
this.$_userPermissions // ['user:view', 'article:edit', ...]
```

#### $_userRoles

当前用户角色列表（computed）

```javascript
this.$_userRoles // ['admin', 'editor', ...]
```

#### $_hasPermission

检查是否有指定权限

```javascript
$_hasPermission(permissions: string | string[]): boolean
```

**参数**

- `permissions` - 权限标识或权限数组

**返回值**

- `true` - 有权限
- `false` - 无权限

#### $_hasRole

检查是否有指定角色

```javascript
$_hasRole(roles: string | string[]): boolean
```

#### $_hasAnyPermission

检查是否有任意权限

```javascript
$_hasAnyPermission(permissions: string[]): boolean
```

#### $_hasAllPermissions

检查是否有所有权限

```javascript
$_hasAllPermissions(permissions: string[]): boolean
```

#### $_checkPermission

权限检查装饰器

```javascript
$_checkPermission(permissions, callback, fallback)
```

**参数**

- `permissions` - 权限标识
- `callback` - 有权限时执行
- `fallback` - 无权限时执行

#### $_checkRoutePermission

路由权限检查

```javascript
$_checkRoutePermission(route): boolean
```

### 示例

```vue
<template>
  <div>
    <!-- 根据权限显示按钮 -->
    <button v-if="$_hasPermission('article:edit')" @click="edit">
      编辑
    </button>
  
    <button v-if="$_hasRole('admin')" @click="delete">
      删除
    </button>
  
    <!-- 需要任意权限 -->
    <div v-if="$_hasAnyPermission(['view', 'edit'])">
      内容区域
    </div>
  </div>
</template>

<script>
import { permissionManager } from '@51jbs/vue2-toolkit'

export default {
  mixins: [permissionManager],
  
  methods: {
    edit() {
      this.$_checkPermission('article:edit', 
        () => {
          // 有权限执行
          this.openEditDialog()
        },
        () => {
          // 无权限执行
          this.$message.warning('无编辑权限')
        }
      )
    }
  },
  
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (!vm.$_checkRoutePermission(to)) {
        vm.$router.push('/403')
      }
    })
  }
}
</script>
```

### Vuex 集成

```javascript
// store/user.js
export default {
  state: {
    permissions: [],
    roles: []
  },
  
  mutations: {
    SET_PERMISSIONS(state, permissions) {
      state.permissions = permissions
    },
    SET_ROLES(state, roles) {
      state.roles = roles
    }
  }
}
```

---

## timerManager

定时器自动清理，防止内存泄漏。

### 使用

```javascript
import { timerManager } from '@51jbs/vue2-toolkit'

export default {
  mixins: [timerManager],
  
  mounted() {
    // 使用 $_setTimeout 代替 setTimeout
    this.$_setTimeout(() => {
      console.log('1秒后执行')
    }, 1000)
  
    // 使用 $_setInterval 代替 setInterval
    this.$_setInterval(() => {
      this.updateTime()
    }, 1000)
  }
  
  // beforeDestroy 自动清理所有定时器
}
```

### API

#### $_setTimeout

创建 setTimeout 定时器

```javascript
$_setTimeout(fn: Function, delay: number): number
```

**返回值**

- 定时器ID

#### $_setInterval

创建 setInterval 定时器

```javascript
$_setInterval(fn: Function, interval: number): number
```

#### $_clearTimeout

清除 setTimeout 定时器

```javascript
$_clearTimeout(timerId: number)
```

#### $_clearInterval

清除 setInterval 定时器

```javascript
$_clearInterval(intervalId: number)
```

#### $_clearAllTimers

清除所有定时器

```javascript
$_clearAllTimers()
```

#### $_debounceTimeout

创建防抖定时器

```javascript
$_debounceTimeout(fn: Function, delay: number = 300): number
```

### 示例

```javascript
export default {
  mixins: [timerManager],
  
  data() {
    return {
      countdown: 60,
      currentTime: new Date()
    }
  },
  
  methods: {
    startCountdown() {
      const timerId = this.$_setInterval(() => {
        this.countdown--
        if (this.countdown === 0) {
          this.$_clearInterval(timerId)
        }
      }, 1000)
    },
  
    delayedAction() {
      this.$_setTimeout(() => {
        this.doSomething()
      }, 2000)
    },
  
    // 防抖搜索
    handleSearch() {
      this.$_debounceTimeout(() => {
        this.fetchResults(this.keyword)
      }, 500)
    }
  },
  
  mounted() {
    // 更新时间
    this.$_setInterval(() => {
      this.currentTime = new Date()
    }, 1000)
  }
}
```

---

## observerManager

Observer 自动管理（ResizeObserver、IntersectionObserver、MutationObserver）。

### 使用

```javascript
import { observerManager } from '@51jbs/vue2-toolkit'

export default {
  mixins: [observerManager],
  
  mounted() {
    const el = this.$refs.box
  
    // 监听元素大小变化
    this.$_createResizeObserver(el, (entries) => {
      console.log('元素大小变化')
    })
  
    // 监听元素进入视口
    this.$_createIntersectionObserver(el, (entries) => {
      if (entries[0].isIntersecting) {
        this.loadData()
      }
    })
  }
  
  // beforeDestroy 自动断开所有 Observer
}
```

### API

#### $_createResizeObserver

创建 ResizeObserver

```javascript
$_createResizeObserver(
  target: Element,
  callback: ResizeObserverCallback
): ResizeObserver | null
```

#### $_createIntersectionObserver

创建 IntersectionObserver

```javascript
$_createIntersectionObserver(
  target: Element,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null
```

#### $_createMutationObserver

创建 MutationObserver

```javascript
$_createMutationObserver(
  target: Node,
  callback: MutationCallback,
  options?: MutationObserverInit
): MutationObserver | null
```

#### $_disconnectObserver

断开指定 Observer

```javascript
$_disconnectObserver(observer: Observer)
```

#### $_disconnectAllObservers

断开所有 Observer

```javascript
$_disconnectAllObservers()
```

### 示例

```javascript
export default {
  mixins: [observerManager],
  
  data() {
    return {
      elementWidth: 0,
      isVisible: false
    }
  },
  
  mounted() {
    const el = this.$refs.container
  
    // 监听大小变化
    this.$_createResizeObserver(el, (entries) => {
      const { width } = entries[0].contentRect
      this.elementWidth = width
    })
  
    // 懒加载图片
    this.$_createIntersectionObserver(
      this.$refs.image,
      (entries) => {
        if (entries[0].isIntersecting) {
          this.loadImage()
        }
      },
      { threshold: 0.1 }
    )
  
    // 监听DOM变化
    this.$_createMutationObserver(
      el,
      (mutations) => {
        console.log('DOM发生变化')
      },
      { childList: true, subtree: true }
    )
  }
}
```

## 组合使用

```javascript
import { 
  eventManager, 
  timerManager, 
  observerManager,
  permissionManager
} from '@51jbs/vue2-toolkit'

export default {
  mixins: [eventManager, timerManager, observerManager, permissionManager],
  
  mounted() {
    // 事件管理
    this.$_addEventListener(window, 'resize', this.handleResize)
  
    // 定时器管理
    this.$_setInterval(this.updateData, 5000)
  
    // Observer管理
    this.$_createResizeObserver(this.$el, this.handleResize)
  
    // 权限检查
    if (this.$_hasPermission('admin')) {
      this.initAdminFeatures()
    }
  }
  
  // 所有资源自动清理
}
```

## Changelog


| 版本  | 变更内容                            | 修改人       | 日期       |
| ----- | ----------------------------------- | ------------ | ---------- |
| 1.0.0 | 新增4个Mixins，提供自动资源管理功能 | Chuanjing Li | 2024-12-15 |
