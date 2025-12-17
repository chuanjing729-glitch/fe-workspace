# Vue 2 开发规范详细指南（面向初级开发者）

> 本指南适用于 Vue 2.x 版本，涵盖从基础到进阶的所有开发规范。

## 📚 目录

- [组件基础](#组件基础)
- [Props 规范](#props-规范)
- [Data 规范](#data-规范)
- [Methods 规范](#methods-规范)
- [Computed 和 Watch](#computed-和-watch)
- [生命周期钩子](#生命周期钩子)
- [模板规范](#模板规范)
- [样式规范](#样式规范)
- [性能优化](#性能优化)

---

## 组件基础

### 1. 组件命名规范

```javascript
// ✅ 推荐：使用多个单词（避免与 HTML 元素冲突）
export default {
  name: 'TodoItem',      // PascalCase 格式
}

// ❌ 错误：单个单词命名
export default {
  name: 'Todo',          // 可能与 <todo> HTML 元素冲突
}

// ❌ 错误：不规范的命名
export default {
  name: 'todo-item',     // 应使用 PascalCase
  name: 'todoItem',      // 应使用 PascalCase
}
```

**为什么？**
- 避免与现有和未来的 HTML 元素冲突
- 提高代码可读性和可维护性
- 符合 Vue 官方推荐

### 2. 组件文件命名

```bash
# ✅ 推荐：PascalCase 格式
TodoItem.vue
UserProfile.vue
ShoppingCart.vue

# ❌ 错误：其他格式
todo-item.vue      # kebab-case（不推荐）
todoItem.vue       # camelCase（不推荐）
todo_item.vue      # snake_case（不推荐）
```

### 3. 组件结构顺序

```vue
<template>
  <!-- 模板内容 -->
</template>

<script>
export default {
  // 1. 组件名称（必需）
  name: 'ComponentName',
  
  // 2. 组件选项（按优先级排序）
  components: {},
  directives: {},
  filters: {},
  mixins: [],
  
  // 3. 组件接口
  props: {},
  emits: [],  // Vue 2.7+ 支持
  
  // 4. 组件状态
  data() {
    return {}
  },
  
  // 5. 计算属性
  computed: {},
  
  // 6. 侦听器
  watch: {},
  
  // 7. 生命周期钩子（按调用顺序）
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  
  // 8. 方法
  methods: {}
}
</script>

<style scoped>
/* 样式内容 */
</style>
```

---

## Props 规范

### 1. Props 定义必须完整

```javascript
// ✅ 推荐：完整的 prop 定义
export default {
  name: 'UserCard',
  props: {
    // 对象类型
    user: {
      type: Object,       // 必需：指定类型
      required: true,     // 必需：是否必填
      default: null,      // 可选：默认值
      validator(value) {  // 可选：自定义验证
        return value && value.id && value.name
      }
    },
    
    // 字符串类型
    title: {
      type: String,
      required: false,
      default: '默认标题'
    },
    
    // 数字类型
    count: {
      type: Number,
      required: false,
      default: 0,
      validator(value) {
        return value >= 0  // 必须是非负数
      }
    },
    
    // 布尔类型
    isActive: {
      type: Boolean,
      default: false
    },
    
    // 数组类型（注意：默认值必须是工厂函数）
    tags: {
      type: Array,
      default: () => []   // ⚠️ 必须使用函数返回
    },
    
    // 对象类型（注意：默认值必须是工厂函数）
    options: {
      type: Object,
      default: () => ({   // ⚠️ 必须使用函数返回
        showIcon: true,
        showLabel: false
      })
    },
    
    // 多类型
    value: {
      type: [String, Number],
      required: true
    }
  }
}

// ❌ 错误：简写形式（缺少验证）
export default {
  props: {
    user: Object,        // 缺少 required、default 等
    title: String,       // 缺少完整定义
    count: Number
  }
}

// ❌ 错误：数组/对象默认值不是函数
export default {
  props: {
    tags: {
      type: Array,
      default: []        // ❌ 错误！会导致所有实例共享同一个数组
    },
    options: {
      type: Object,
      default: {}        // ❌ 错误！会导致所有实例共享同一个对象
    }
  }
}
```

**为什么？**
- 类型检查：在开发时快速发现错误
- 文档作用：prop 定义即文档，方便团队成员理解
- 默认值保护：避免 undefined 错误
- 避免数据污染：工厂函数确保每个实例独立

### 2. 禁止直接修改 Props

```javascript
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  
  methods: {
    // ❌ 错误：直接修改 prop
    updateUserName() {
      this.user.name = '新名字'  // 会修改父组件的数据！
    },
    
    // ✅ 推荐：通过事件通知父组件
    updateUserName() {
      this.$emit('update:user', {
        ...this.user,
        name: '新名字'
      })
    },
    
    // ✅ 推荐：使用本地副本
    created() {
      this.localUser = { ...this.user }
    },
    updateLocalUser() {
      this.localUser.name = '新名字'
    }
  }
}
```

**为什么？**
- 单向数据流：保持数据流向清晰
- 避免副作用：不会意外修改父组件数据
- 易于调试：数据变化可追踪

---

## Data 规范

### 1. Data 必须是函数

```javascript
// ✅ 推荐：data 是函数
export default {
  data() {
    return {
      userName: '',
      userAge: 0,
      isActive: false
    }
  }
}

// ❌ 错误：data 是对象（会导致所有实例共享数据）
export default {
  data: {
    userName: '',  // ❌ 所有组件实例会共享这个对象！
    userAge: 0
  }
}
```

**为什么？**
- 每个组件实例都有独立的数据副本
- 避免数据污染和意外的副作用

### 2. 合理的数据结构

```javascript
// ✅ 推荐：清晰的数据结构
export default {
  data() {
    return {
      // 用户信息
      user: {
        id: null,
        name: '',
        email: '',
        role: 'user'
      },
      
      // 表单状态
      form: {
        loading: false,
        errors: {},
        touched: {}
      },
      
      // 列表数据
      list: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        loading: false
      }
    }
  }
}

// ❌ 错误：扁平化的数据（难以维护）
export default {
  data() {
    return {
      userId: null,
      userName: '',
      userEmail: '',
      userRole: 'user',
      formLoading: false,
      formErrors: {},
      formTouched: {},
      listItems: [],
      listTotal: 0,
      listPage: 1,
      listPageSize: 10,
      listLoading: false
    }
  }
}
```

---

## Methods 规范

### 1. 方法命名规范

```javascript
export default {
  methods: {
    // ✅ 推荐：动词开头，语义清晰
    handleClick() {},
    handleSubmit() {},
    handleChange() {},
    
    fetchUserData() {},
    loadMoreItems() {},
    
    validateForm() {},
    resetForm() {},
    
    showDialog() {},
    hideDialog() {},
    toggleSidebar() {},
    
    // ❌ 错误：命名不清晰
    click() {},          // 太短，不明确
    process() {},        // 太泛，不知道处理什么
    doSomething() {},    // 没有实际意义
    func1() {},          // 完全看不懂
  }
}
```

**命名规则**：
- **handle + 事件名**：事件处理器（handleClick、handleSubmit）
- **动词 + 名词**：业务操作（fetchUserData、validateForm）
- **show/hide/toggle**：显示控制（showDialog、toggleSidebar）
- **get/set**：数据访问（getUserInfo、setUserRole）

### 2. 方法职责单一

```javascript
// ✅ 推荐：职责单一，易于测试和维护
export default {
  methods: {
    // 提交表单
    async handleSubmit() {
      if (!this.validateForm()) return
      
      this.setLoading(true)
      try {
        const result = await this.submitData()
        this.handleSuccess(result)
      } catch (error) {
        this.handleError(error)
      } finally {
        this.setLoading(false)
      }
    },
    
    // 验证表单
    validateForm() {
      if (!this.form.name) {
        this.showError('请输入姓名')
        return false
      }
      if (!this.form.email) {
        this.showError('请输入邮箱')
        return false
      }
      return true
    },
    
    // 提交数据
    async submitData() {
      return await this.$http.post('/api/users', this.form)
    },
    
    // 处理成功
    handleSuccess(result) {
      this.$message.success('提交成功')
      this.$emit('submit-success', result)
      this.resetForm()
    },
    
    // 处理错误
    handleError(error) {
      this.$message.error(error.message || '提交失败')
      console.error('Submit failed:', error)
    },
    
    // 设置加载状态
    setLoading(loading) {
      this.isLoading = loading
    },
    
    // 显示错误
    showError(message) {
      this.$message.error(message)
    },
    
    // 重置表单
    resetForm() {
      this.form = {
        name: '',
        email: ''
      }
    }
  }
}

// ❌ 错误：一个方法做太多事情
export default {
  methods: {
    handleSubmit() {
      // 验证
      if (!this.form.name) {
        this.$message.error('请输入姓名')
        return
      }
      if (!this.form.email) {
        this.$message.error('请输入邮箱')
        return
      }
      
      // 提交
      this.isLoading = true
      this.$http.post('/api/users', this.form)
        .then(result => {
          this.$message.success('提交成功')
          this.$emit('submit-success', result)
          this.form = { name: '', email: '' }
        })
        .catch(error => {
          this.$message.error(error.message || '提交失败')
          console.error('Submit failed:', error)
        })
        .finally(() => {
          this.isLoading = false
        })
    }
  }
}
```

---

## Computed 和 Watch

### 1. Computed 计算属性

```javascript
export default {
  data() {
    return {
      firstName: 'Zhang',
      lastName: 'San',
      items: [
        { id: 1, price: 10, selected: true },
        { id: 2, price: 20, selected: false },
        { id: 3, price: 30, selected: true }
      ]
    }
  },
  
  computed: {
    // ✅ 推荐：简单的计算属性
    fullName() {
      return `${this.firstName} ${this.lastName}`
    },
    
    // ✅ 推荐：数组过滤和计算
    selectedItems() {
      return this.items.filter(item => item.selected)
    },
    
    totalPrice() {
      return this.selectedItems.reduce((sum, item) => sum + item.price, 0)
    },
    
    // ✅ 推荐：带 getter 和 setter
    fullNameWithSet: {
      get() {
        return `${this.firstName} ${this.lastName}`
      },
      set(value) {
        const [firstName, lastName] = value.split(' ')
        this.firstName = firstName
        this.lastName = lastName
      }
    }
  },
  
  // ❌ 错误：在方法中做计算属性的事
  methods: {
    getFullName() {
      return `${this.firstName} ${this.lastName}`  // 应该用 computed
    },
    getTotalPrice() {
      return this.items
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.price, 0)  // 应该用 computed
    }
  }
}
```

**为什么使用 Computed？**
- 缓存：只在依赖变化时重新计算
- 性能：避免重复计算
- 语义化：代码更清晰

**Computed vs Methods**：
- Computed：依赖响应式数据，有缓存，用于计算派生数据
- Methods：不缓存，用于执行操作和事件处理

### 2. Watch 侦听器

```javascript
export default {
  data() {
    return {
      userId: null,
      searchQuery: '',
      user: {
        name: '',
        email: ''
      }
    }
  },
  
  watch: {
    // ✅ 推荐：简单侦听
    userId(newValue, oldValue) {
      console.log(`User ID changed from ${oldValue} to ${newValue}`)
      this.fetchUserData(newValue)
    },
    
    // ✅ 推荐：立即执行
    searchQuery: {
      handler(newValue) {
        this.debounceSearch(newValue)
      },
      immediate: true  // 组件创建时立即执行
    },
    
    // ✅ 推荐：深度侦听对象
    user: {
      handler(newValue, oldValue) {
        console.log('User object changed')
        this.saveUserData(newValue)
      },
      deep: true  // 侦听对象内部值的变化
    },
    
    // ✅ 推荐：侦听对象的特定属性
    'user.email'(newValue, oldValue) {
      console.log(`Email changed from ${oldValue} to ${newValue}`)
      this.validateEmail(newValue)
    }
  },
  
  methods: {
    // 推荐：防抖处理
    debounceSearch: _.debounce(function(query) {
      this.performSearch(query)
    }, 300)
  }
}
```

**Watch 使用场景**：
- 数据变化时执行异步操作
- 执行开销较大的操作
- 需要访问旧值和新值
- 需要立即执行或深度侦听

**⚠️ 注意**：
- 不要滥用 deep watch，性能开销大
- 优先使用 computed 而非 watch
- watch 中避免直接修改被侦听的数据（会导致死循环）

---

## 生命周期钩子

### 1. 生命周期顺序和用途

```javascript
export default {
  // ⚠️ 注意：生命周期钩子名称必须拼写正确！
  
  // 1. 创建前（此时 data 和 methods 还未初始化）
  beforeCreate() {
    // ❌ 错误：访问 this.xxx（此时还不存在）
    // console.log(this.userName)
    
    // ✅ 可以：初始化插件、注册全局事件总线
  },
  
  // 2. 创建后（data 和 methods 已初始化，但 DOM 未挂载）
  created() {
    // ✅ 推荐：初始化数据
    this.userName = 'Admin'
    
    // ✅ 推荐：调用 API 获取数据
    this.fetchUserData()
    
    // ✅ 推荐：设置定时器
    this.timer = setInterval(() => {
      this.updateTime()
    }, 1000)
    
    // ❌ 错误：操作 DOM（此时 DOM 还未生成）
    // this.$refs.input.focus()
  },
  
  // 3. 挂载前（模板已编译，但未挂载到 DOM）
  beforeMount() {
    // 很少使用
  },
  
  // 4. 挂载后（DOM 已挂载，可以访问 $refs）
  mounted() {
    // ✅ 推荐：DOM 操作
    this.$refs.input.focus()
    
    // ✅ 推荐：初始化第三方库
    this.chart = echarts.init(this.$refs.chartContainer)
    
    // ✅ 推荐：添加事件监听器
    window.addEventListener('resize', this.handleResize)
    
    // ✅ 推荐：初始化滚动监听
    this.$refs.scrollContainer.addEventListener('scroll', this.handleScroll)
  },
  
  // 5. 更新前（数据变化，DOM 未重新渲染）
  beforeUpdate() {
    // 很少使用
  },
  
  // 6. 更新后（数据变化，DOM 已重新渲染）
  updated() {
    // ⚠️ 注意：不要在 updated 中修改数据，会导致死循环！
    
    // ✅ 可以：访问更新后的 DOM
    console.log('DOM 已更新')
  },
  
  // 7. 销毁前（组件即将销毁，但功能仍可用）
  // ⚠️ 重要：名称是 beforeDestroy 不是 beforedestory！
  beforeDestroy() {
    // ✅ 必须：清理定时器
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    
    // ✅ 必须：移除事件监听器
    window.removeEventListener('resize', this.handleResize)
    this.$refs.scrollContainer?.removeEventListener('scroll', this.handleScroll)
    
    // ✅ 必须：销毁第三方库实例
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
    
    // ✅ 必须：取消未完成的异步请求
    if (this.cancelToken) {
      this.cancelToken.cancel('Component destroyed')
    }
    
    // ✅ 必须：清理 EventBus 监听
    this.$bus?.$off('update', this.handleUpdate)
  },
  
  // 8. 销毁后
  destroyed() {
    // 额外的清理工作
    console.log('Component destroyed')
  },
  
  methods: {
    fetchUserData() {
      // API 调用
    },
    updateTime() {
      // 更新时间
    },
    handleResize() {
      // 处理窗口大小变化
    },
    handleScroll() {
      // 处理滚动
    },
    handleUpdate() {
      // 处理更新事件
    }
  }
}
```

**⚠️ 常见错误**：

```javascript
// ❌ 错误 1：拼写错误
export default {
  beforedestory() {  // ❌ 错误！应该是 beforeDestroy
    this.cleanup()
  }
}

// ❌ 错误 2：忘记清理资源
export default {
  mounted() {
    this.timer = setInterval(() => {}, 1000)
  }
  // ❌ 忘记清理定时器！会导致内存泄漏
}

// ❌ 错误 3：在 created 中操作 DOM
export default {
  created() {
    this.$refs.input.focus()  // ❌ 错误！此时 DOM 还未挂载
  }
}

// ❌ 错误 4：在 updated 中修改数据
export default {
  updated() {
    this.count++  // ❌ 错误！会导致无限循环
  }
}
```

---

## 模板规范

### 1. v-for 必须使用 key

```vue
<template>
  <!-- ✅ 推荐：使用唯一 ID 作为 key -->
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- ✅ 可以：当项目没有 ID 时，使用组合键 -->
  <div v-for="(item, index) in list" :key="`${item.name}-${index}`">
    {{ item.name }}
  </div>
  
  <!-- ⚠️ 不推荐：使用 index 作为 key（当列表会重排序时） -->
  <div v-for="(item, index) in list" :key="index">
    {{ item.name }}
  </div>
  
  <!-- ❌ 错误：没有 key -->
  <div v-for="item in list">
    {{ item.name }}
  </div>
</template>
```

**为什么需要 key？**
- 帮助 Vue 识别节点
- 提高列表渲染性能
- 避免渲染错误

**为什么不推荐用 index？**
- 当列表重新排序时，index 会变化，导致不必要的 DOM 操作
- 可能导致组件状态错误

### 2. v-if vs v-show

```vue
<template>
  <!-- ✅ 推荐：不频繁切换，使用 v-if -->
  <div v-if="isAdmin">
    管理员面板
  </div>
  
  <!-- ✅ 推荐：频繁切换，使用 v-show -->
  <div v-show="isVisible">
    可见内容
  </div>
  
  <!-- ❌ 错误：在 v-for 中使用 v-if -->
  <div v-for="item in list" v-if="item.isActive" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- ✅ 推荐：先过滤再渲染 -->
  <div v-for="item in activeList" :key="item.id">
    {{ item.name }}
  </div>
</template>

<script>
export default {
  computed: {
    activeList() {
      return this.list.filter(item => item.isActive)
    }
  }
}
</script>
```

**v-if vs v-show 对比**：

| 特性 | v-if | v-show |
|------|------|--------|
| 渲染方式 | 条件渲染（DOM元素会被移除/添加） | 始终渲染（通过 CSS display 控制） |
| 初始渲染成本 | 低（false 时不渲染） | 高（始终渲染） |
| 切换成本 | 高（重新渲染） | 低（只改 CSS） |
| 使用场景 | 不频繁切换 | 频繁切换 |

### 3. 避免 v-for 和 v-if 同时使用

```vue
<template>
  <!-- ❌ 错误：v-for 和 v-if 在同一元素上 -->
  <div v-for="user in users" v-if="user.isActive" :key="user.id">
    {{ user.name }}
  </div>
  
  <!-- ✅ 推荐方式 1：使用计算属性过滤 -->
  <div v-for="user in activeUsers" :key="user.id">
    {{ user.name }}
  </div>
  
  <!-- ✅ 推荐方式 2：使用嵌套模板 -->
  <template v-for="user in users">
    <div v-if="user.isActive" :key="user.id">
      {{ user.name }}
    </div>
  </template>
</template>

<script>
export default {
  data() {
    return {
      users: [
        { id: 1, name: 'Alice', isActive: true },
        { id: 2, name: 'Bob', isActive: false },
        { id: 3, name: 'Charlie', isActive: true }
      ]
    }
  },
  
  computed: {
    // 推荐：使用计算属性过滤
    activeUsers() {
      return this.users.filter(user => user.isActive)
    }
  }
}
</script>
```

**为什么？**
- v-for 的优先级高于 v-if
- 会先遍历整个列表，然后再判断条件，浪费性能
- 使用计算属性过滤更高效、更清晰

---

## 样式规范

### 1. 使用 scoped 样式

```vue
<template>
  <div class="user-card">
    <h3 class="user-card__title">{{ user.name }}</h3>
    <p class="user-card__content">{{ user.bio }}</p>
  </div>
</template>

<!-- ✅ 推荐：使用 scoped -->
<style scoped>
.user-card {
  padding: 20px;
  border: 1px solid #ddd;
}

.user-card__title {
  font-size: 18px;
  font-weight: bold;
}

.user-card__content {
  color: #666;
}
</style>

<!-- ❌ 错误：不使用 scoped（会污染全局样式） -->
<style>
.title {
  font-size: 18px;  /* 会影响所有 .title 类！ */
}
</style>
```

### 2. BEM 命名规范

```vue
<template>
  <div class="user-card">
    <!-- Block: user-card -->
    <div class="user-card__header">
      <!-- Element: __header -->
      <h3 class="user-card__title">{{ user.name }}</h3>
    </div>
    
    <div class="user-card__body">
      <!-- Element: __body -->
      <p class="user-card__description">{{ user.bio }}</p>
    </div>
    
    <div class="user-card__footer user-card__footer--active">
      <!-- Element: __footer, Modifier: --active -->
      <button class="user-card__button user-card__button--primary">
        <!-- Element: __button, Modifier: --primary -->
        确定
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Block */
.user-card {
  padding: 20px;
}

/* Element */
.user-card__header {
  margin-bottom: 10px;
}

.user-card__title {
  font-size: 18px;
}

.user-card__body {
  margin-bottom: 10px;
}

.user-card__footer {
  text-align: right;
}

/* Modifier */
.user-card__footer--active {
  background-color: #f0f0f0;
}

.user-card__button {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}

.user-card__button--primary {
  background-color: #1890ff;
  color: white;
}
</style>
```

**BEM 规则**：
- **Block（块）**：独立的组件（user-card）
- **Element（元素）**：块的组成部分，用 `__` 连接（user-card__title）
- **Modifier（修饰符）**：块或元素的不同状态，用 `--` 连接（user-card__button--primary）

---

## 性能优化

### 1. 使用 v-once 渲染静态内容

```vue
<template>
  <!-- ✅ 推荐：静态内容使用 v-once -->
  <div v-once>
    <h1>{{ staticTitle }}</h1>
    <p>这是不会变化的静态内容</p>
  </div>
  
  <!-- 动态内容正常渲染 -->
  <div>
    <p>当前时间：{{ currentTime }}</p>
  </div>
</template>
```

### 2. 使用函数式组件

```vue
<!-- ✅ 推荐：简单的展示组件使用函数式组件 -->
<template functional>
  <div class="user-item">
    <span>{{ props.user.name }}</span>
    <span>{{ props.user.age }}</span>
  </div>
</template>

<script>
export default {
  name: 'UserItem',
  functional: true,  // 声明为函数式组件
  props: {
    user: {
      type: Object,
      required: true
    }
  }
}
</script>
```

**什么时候使用函数式组件？**
- 组件无状态（没有 data）
- 组件无实例（没有 this）
- 组件只接收 props
- 纯展示组件

**优势**：
- 渲染性能提升 2-3 倍
- 内存占用更少

### 3. 使用 keep-alive 缓存组件

```vue
<template>
  <!-- ✅ 推荐：缓存需要频繁切换的组件 -->
  <keep-alive>
    <component :is="currentComponent" />
  </keep-alive>
  
  <!-- ✅ 推荐：缓存特定的组件 -->
  <keep-alive include="UserList,UserDetail">
    <router-view />
  </keep-alive>
  
  <!-- ✅ 推荐：排除某些组件 -->
  <keep-alive exclude="UserEdit">
    <router-view />
  </keep-alive>
  
  <!-- ✅ 推荐：限制缓存数量 -->
  <keep-alive :max="10">
    <router-view />
  </keep-alive>
</template>

<script>
export default {
  // 组件激活时调用
  activated() {
    console.log('Component activated')
    // 刷新数据
    this.fetchData()
  },
  
  // 组件停用时调用
  deactivated() {
    console.log('Component deactivated')
    // 暂停定时器
    this.pauseTimer()
  }
}
</script>
```

---

## 常见错误和最佳实践总结

### ❌ 常见错误

| 错误 | 说明 | 正确做法 |
|------|------|---------|
| `beforedestory()` | 拼写错误 | `beforeDestroy()` |
| `this.user.name = '新名字'` | 直接修改 prop | 通过 $emit 通知父组件 |
| `data: {}` | data 是对象 | `data() { return {} }` |
| `default: []` | 数组默认值不是函数 | `default: () => []` |
| `v-for` 没有 key | 缺少 key | 添加 `:key="item.id"` |
| `v-for` 和 `v-if` 同时使用 | 性能问题 | 使用计算属性过滤 |
| `updated()` 中修改数据 | 导致死循环 | 避免在 updated 中修改数据 |
| 忘记清理定时器 | 内存泄漏 | 在 beforeDestroy 中清理 |
| 在 created 中操作 DOM | DOM 未挂载 | 在 mounted 中操作 |

### ✅ 最佳实践检查清单

- [ ] 组件名称使用 PascalCase 多个单词
- [ ] Props 定义完整（type、required、default）
- [ ] 数组/对象默认值使用工厂函数
- [ ] 不直接修改 props
- [ ] data 是函数不是对象
- [ ] v-for 总是使用 key
- [ ] 不在同一元素上同时使用 v-for 和 v-if
- [ ] 生命周期钩子拼写正确
- [ ] 在 beforeDestroy 中清理所有资源
- [ ] 使用 scoped 样式
- [ ] 方法命名语义清晰
- [ ] 计算属性用于派生数据
- [ ] watch 用于执行异步操作

---

## 学习资源

- [Vue 2 官方文档](https://v2.cn.vuejs.org/)
- [Vue 2 风格指南](https://v2.cn.vuejs.org/v2/style-guide/)
- [Vue Router 官方文档](https://v3.router.vuejs.org/zh/)
- [Vuex 官方文档](https://v3.vuex.vuejs.org/zh/)
