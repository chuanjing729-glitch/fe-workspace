# 内存管理规范

## EventBus 使用规范

```javascript
// ❌ 错误：匿名函数无法清理
mounted() {
  window.eventBus.$on('update', (data) => {
    this.handleUpdate(data)
  })
}

// ✅ 正确：使用命名方法
export default {
  mounted() {
    window.eventBus.$on('update', this.handleUpdate)
  },
  
  beforeDestroy() {
    // ⭐ 必须清理
    window.eventBus.$off('update', this.handleUpdate)
  },
  
  methods: {
    handleUpdate(data) {
      // 处理逻辑
    }
  }
}

// ✅ 推荐：使用 mixin 统一管理
import eventManager from '@/mixins/event-manager'

export default {
  mixins: [eventManager],
  
  mounted() {
    // 自动管理的事件监听
    this.$_on(window.eventBus, 'update', this.handleUpdate)
  }
  // beforeDestroy 会自动清理
}
```

## 定时器管理规范

```javascript
export default {
  data() {
    return {
      timer: null,
      timers: [] // 管理多个定时器
    }
  },
  
  methods: {
    // ❌ 错误：定时器未清理
    // startPolling() {
    //   setInterval(() => {
    //     this.fetchData()
    //   }, 5000)
    // },
    
    // ✅ 正确：保存定时器引用并清理
    startPolling() {
      this.timer = setInterval(() => {
        this.fetchData()
      }, 5000)
    },
    
    stopPolling() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    }
  },
  
  beforeDestroy() {
    // ⭐ 必须清理定时器
    this.stopPolling()
  }
}

// ✅ 推荐：使用 mixin 统一管理
import timerManager from '@/mixins/timer-manager'

export default {
  mixins: [timerManager],
  
  methods: {
    startPolling() {
      this.$_setInterval(() => {
        this.fetchData()
      }, 5000)
    }
  }
  // beforeDestroy 会自动清理所有定时器
}
```

## Observer 管理规范

```javascript
export default {
  mounted() {
    // ✅ 创建 Observer
    this.resizeObserver = new ResizeObserver(entries => {
      this.handleResize(entries)
    })
    this.resizeObserver.observe(this.$el)
    
    this.intersectionObserver = new IntersectionObserver(entries => {
      this.handleIntersection(entries)
    })
    this.intersectionObserver.observe(this.$refs.target)
  },
  
  beforeDestroy() {
    // ⭐ 必须清理 Observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }
  }
}
```

## DOM 事件监听器规范

```javascript
export default {
  mounted() {
    // ✅ 保存事件处理器引用
    this.handleResize = () => {
      this.updateLayout()
    }
    
    this.handleScroll = () => {
      this.checkPosition()
    }
    
    // 添加监听器
    window.addEventListener('resize', this.handleResize)
    document.addEventListener('scroll', this.handleScroll, { passive: true })
  },
  
  beforeDestroy() {
    // ⭐ 必须移除监听器
    if (this.handleResize) {
      window.removeEventListener('resize', this.handleResize)
    }
    
    if (this.handleScroll) {
      document.removeEventListener('scroll', this.handleScroll)
    }
  }
}

// ❌ 禁止：bind(this) 导致无法移除
// mounted() {
//   window.addEventListener('resize', this.handleResize.bind(this))
// }
// beforeDestroy() {
//   window.removeEventListener('resize', this.handleResize.bind(this)) // ❌ 移除失败
// }
```