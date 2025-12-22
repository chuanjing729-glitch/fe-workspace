# 事件规范指南

> 本规范涵盖 Vue2 和 JavaScript 的事件处理最佳实践，旨在避免常见的事件处理问题，提高代码质量。

---

## 📋 目录

- [Vue2 事件规范](#vue2-事件规范)
  - [事件命名规范](#vue2-事件命名规范)
  - [自定义事件参数](#vue2-自定义事件参数)
  - [事件监听器清理](#vue2-事件监听器清理)
  - [事件修饰符使用](#vue2-事件修饰符使用)
  - [避免模糊事件名](#vue2-避免模糊事件名)
- [JavaScript 事件规范](#javascript-事件规范)
  - [事件监听器清理](#js-事件监听器清理)
  - [事件处理函数命名](#js-事件处理函数命名)
  - [事件对象命名](#js-事件对象命名)
  - [事件委托](#js-事件委托)

---

## Vue2 事件规范

### Vue2: 事件命名规范

**规则名称**：`event/vue-event-naming`

**规则说明**：Vue 自定义事件应使用 kebab-case 命名，避免使用驼峰命名。

**为什么？**
- HTML 属性名不区分大小写
- 驼峰命名在 DOM 模板中无法正确工作
- kebab-case 更符合 HTML 规范

#### ✅ 推荐写法

```vue
<template>
  <div>
    <!-- ✅ 使用 kebab-case -->
    <child-component @update-user="handleUpdateUser" />
    <child-component @submit-form="handleSubmitForm" />
    <child-component @close-dialog="handleCloseDialog" />
  </div>
</template>

<script>
export default {
  methods: {
    handleUpdateUser(userData) {
      // 处理用户更新
    },
    handleSubmitForm(formData) {
      // 处理表单提交
    },
    handleCloseDialog() {
      // 处理对话框关闭
    }
  }
}
</script>
```

#### ❌ 错误写法

```vue
<template>
  <div>
    <!-- ❌ 使用驼峰命名 -->
    <child-component @updateUser="handleUpdateUser" />
    <child-component @submitForm="handleSubmitForm" />
  </div>
</template>
```

---

### Vue2: 自定义事件参数

**规则名称**：`event/vue-emit-params`

**规则说明**：$emit 触发自定义事件时应传递明确的数据参数。

**为什么？**
- 提高事件的可读性和可维护性
- 父组件能明确知道接收什么数据
- 便于类型检查和文档生成

#### ✅ 推荐写法

```vue
<script>
export default {
  methods: {
    submitForm() {
      const formData = {
        username: this.username,
        email: this.email
      }
      // ✅ 传递明确的数据
      this.$emit('submit-form', formData)
    },
    
    updateStatus(newStatus) {
      // ✅ 传递状态信息
      this.$emit('status-change', {
        oldStatus: this.status,
        newStatus: newStatus,
        timestamp: Date.now()
      })
    },
    
    closeDialog() {
      // ✅ 即使没有数据，也传递一个标识
      this.$emit('close', { confirmed: true })
    }
  }
}
</script>
```

#### ❌ 错误写法

```vue
<script>
export default {
  methods: {
    submitForm() {
      // ❌ 没有传递数据
      this.$emit('submit-form')
    },
    
    closeDialog() {
      // ❌ 不明确的事件触发
      this.$emit('close')
    }
  }
}
</script>
```

---

### Vue2: 事件监听器清理

**规则名称**：`event/vue-listener-cleanup`

**规则说明**：使用 `addEventListener` 添加的事件监听器必须在 `beforeDestroy` 中移除。

**为什么？**
- 防止内存泄漏
- 避免组件销毁后仍然响应事件
- 提高应用性能

#### ✅ 推荐写法

```vue
<script>
export default {
  data() {
    return {
      resizeHandler: null
    }
  },
  
  mounted() {
    // ✅ 保存处理函数引用
    this.resizeHandler = () => {
      this.handleResize()
    }
    
    window.addEventListener('resize', this.resizeHandler)
    window.addEventListener('scroll', this.handleScroll)
    document.addEventListener('click', this.handleDocumentClick)
  },
  
  beforeDestroy() {
    // ✅ 在销毁前移除所有监听器
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
    }
    window.removeEventListener('scroll', this.handleScroll)
    document.removeEventListener('click', this.handleDocumentClick)
  },
  
  methods: {
    handleResize() {
      // 处理窗口大小变化
    },
    handleScroll() {
      // 处理滚动
    },
    handleDocumentClick() {
      // 处理文档点击
    }
  }
}
</script>
```

#### ❌ 错误写法

```vue
<script>
export default {
  mounted() {
    // ❌ 添加了监听器但没有清理
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('scroll', this.handleScroll)
  },
  
  // ❌ 缺少 beforeDestroy 钩子
  
  methods: {
    handleResize() {
      // 处理窗口大小变化
    }
  }
}
</script>
```

---

### Vue2: 事件修饰符使用

**规则名称**：`event/vue-prefer-modifiers`

**规则说明**：推荐在模板中使用事件修饰符（.prevent、.stop 等），而不是在方法中调用。

**为什么？**
- 代码更简洁清晰
- 关注点分离：模板处理事件流，方法处理业务逻辑
- 减少不必要的事件对象传递

#### ✅ 推荐写法

```vue
<template>
  <div>
    <!-- ✅ 使用 .prevent 修饰符 -->
    <form @submit.prevent="handleSubmit">
      <button type="submit">提交</button>
    </form>
    
    <!-- ✅ 使用 .stop 修饰符 -->
    <div @click="handleParentClick">
      <button @click.stop="handleChildClick">点击</button>
    </div>
    
    <!-- ✅ 组合修饰符 -->
    <input @keyup.enter.prevent="handleSearch" />
    
    <!-- ✅ 使用 .once 修饰符 -->
    <button @click.once="handleFirstClick">只触发一次</button>
  </div>
</template>

<script>
export default {
  methods: {
    handleSubmit() {
      // ✅ 专注于业务逻辑
      console.log('提交表单')
    },
    
    handleChildClick() {
      console.log('子元素点击')
    },
    
    handleParentClick() {
      console.log('父元素点击')
    }
  }
}
</script>
```

#### ❌ 错误写法

```vue
<template>
  <div>
    <!-- ❌ 不使用修饰符 -->
    <form @submit="handleSubmit">
      <button type="submit">提交</button>
    </form>
    
    <div @click="handleParentClick">
      <button @click="handleChildClick">点击</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    handleSubmit(event) {
      // ❌ 在方法中调用
      event.preventDefault()
      console.log('提交表单')
    },
    
    handleChildClick(event) {
      // ❌ 在方法中调用
      event.stopPropagation()
      console.log('子元素点击')
    }
  }
}
</script>
```

---

### Vue2: 避免模糊事件名

**规则名称**：`event/vue-specific-event-name`

**规则说明**：避免使用 click、change、input 等过于模糊的事件名称。

**为什么？**
- 提高代码可读性
- 明确事件的业务含义
- 便于维护和调试

#### ✅ 推荐写法

```vue
<script>
export default {
  methods: {
    submitUserForm() {
      // ✅ 具体的事件名称
      this.$emit('submit-user-form', this.formData)
    },
    
    updateUserProfile() {
      // ✅ 明确的业务含义
      this.$emit('update-profile', this.profileData)
    },
    
    selectProduct(product) {
      // ✅ 清楚表明选择了产品
      this.$emit('select-product', product)
    },
    
    confirmDelete() {
      // ✅ 明确的操作意图
      this.$emit('confirm-delete', { id: this.itemId })
    }
  }
}
</script>
```

#### ❌ 错误写法

```vue
<script>
export default {
  methods: {
    handleAction() {
      // ❌ 太模糊，不知道什么操作
      this.$emit('action')
      this.$emit('click')
      this.$emit('change')
    },
    
    handleEvent() {
      // ❌ 完全不知道是什么事件
      this.$emit('event', this.data)
      this.$emit('handle', this.data)
    }
  }
}
</script>
```

---

## JavaScript 事件规范

### JS: 事件监听器清理

**规则名称**：`event/js-listener-cleanup`

**规则说明**：`addEventListener` 添加的监听器必须有对应的 `removeEventListener`。

**为什么？**
- 防止内存泄漏
- 避免重复绑定
- 提高应用性能

#### ✅ 推荐写法

```javascript
class EventManager {
  constructor() {
    this.handlers = new Map()
  }
  
  // ✅ 添加监听器时保存引用
  init() {
    this.resizeHandler = this.handleResize.bind(this)
    this.scrollHandler = this.handleScroll.bind(this)
    
    window.addEventListener('resize', this.resizeHandler)
    window.addEventListener('scroll', this.scrollHandler)
  }
  
  // ✅ 提供清理方法
  destroy() {
    window.removeEventListener('resize', this.resizeHandler)
    window.removeEventListener('scroll', this.scrollHandler)
  }
  
  handleResize() {
    console.log('窗口大小改变')
  }
  
  handleScroll() {
    console.log('页面滚动')
  }
}

// ✅ 使用时清理
const manager = new EventManager()
manager.init()

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  manager.destroy()
})
```

```javascript
// ✅ 使用 AbortController（现代浏览器）
const controller = new AbortController()
const signal = controller.signal

window.addEventListener('resize', handleResize, { signal })
window.addEventListener('scroll', handleScroll, { signal })

// 一次性移除所有监听器
controller.abort()
```

#### ❌ 错误写法

```javascript
// ❌ 没有清理机制
class BadEventManager {
  init() {
    window.addEventListener('resize', () => {
      console.log('resize')  // ❌ 匿名函数无法移除
    })
    
    window.addEventListener('scroll', this.handleScroll)
    // ❌ 没有 destroy 方法清理
  }
  
  handleScroll() {
    console.log('scroll')
  }
}
```

---

### JS: 事件处理函数命名

**规则名称**：`event/js-handler-naming`

**规则说明**：事件处理函数应使用 `handle*` 或 `on*` 前缀命名。

**为什么？**
- 一眼就能识别出是事件处理函数
- 统一的命名规范
- 提高代码可读性

#### ✅ 推荐写法

```javascript
class UserForm {
  constructor() {
    this.bindEvents()
  }
  
  bindEvents() {
    // ✅ 使用 handle* 前缀
    document.getElementById('submit-btn').addEventListener('click', this.handleSubmit)
    document.getElementById('cancel-btn').addEventListener('click', this.handleCancel)
    
    // ✅ 使用 on* 前缀
    window.addEventListener('resize', this.onWindowResize)
    document.addEventListener('keydown', this.onKeyDown)
  }
  
  handleSubmit = (event) => {
    event.preventDefault()
    console.log('提交表单')
  }
  
  handleCancel = (event) => {
    console.log('取消操作')
  }
  
  onWindowResize = (event) => {
    console.log('窗口大小改变')
  }
  
  onKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.handleCancel()
    }
  }
}
```

#### ❌ 错误写法

```javascript
class BadUserForm {
  bindEvents() {
    // ❌ 不规范的命名
    document.getElementById('submit-btn').addEventListener('click', this.submit)
    document.getElementById('cancel-btn').addEventListener('click', this.cancel)
    window.addEventListener('resize', this.resize)
  }
  
  submit(event) {  // ❌ 看不出是事件处理函数
    console.log('提交')
  }
  
  cancel(event) {  // ❌ 可能与业务方法混淆
    console.log('取消')
  }
  
  resize(event) {  // ❌ 不清晰
    console.log('改变大小')
  }
}
```

---

### JS: 事件对象命名

**规则名称**：`event/prefer-event-name`

**规则说明**：事件参数建议使用完整的 `event` 而不是缩写 `e` 或 `evt`。

**为什么？**
- 提高代码可读性
- 新手更容易理解
- 避免与其他变量混淆

#### ✅ 推荐写法

```javascript
// ✅ 使用完整的 event
function handleClick(event) {
  event.preventDefault()
  event.stopPropagation()
  console.log('点击位置:', event.clientX, event.clientY)
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    console.log('按下回车键')
  }
}

// ✅ 箭头函数
const handleSubmit = (event) => {
  event.preventDefault()
  const formData = new FormData(event.target)
  console.log('表单数据:', formData)
}
```

#### ❌ 错误写法

```javascript
// ❌ 使用缩写
function handleClick(e) {
  e.preventDefault()
  console.log(e.clientX)
}

function handleKeyPress(evt) {
  if (evt.key === 'Enter') {
    console.log('回车')
  }
}
```

---

### JS: 事件委托

**规则名称**：`event/prefer-delegation`

**规则说明**：当有多个相同类型的事件监听器时，建议使用事件委托优化性能。

**为什么？**
- 减少内存占用
- 动态元素自动响应事件
- 提高性能

#### ✅ 推荐写法

```javascript
// ✅ 使用事件委托
class TodoList {
  constructor() {
    this.listElement = document.getElementById('todo-list')
    this.bindEvents()
  }
  
  bindEvents() {
    // ✅ 在父元素上监听一次
    this.listElement.addEventListener('click', this.handleListClick)
  }
  
  handleListClick = (event) => {
    const target = event.target
    
    // 根据点击的元素类型处理
    if (target.classList.contains('delete-btn')) {
      this.handleDelete(target)
    } else if (target.classList.contains('edit-btn')) {
      this.handleEdit(target)
    } else if (target.classList.contains('complete-btn')) {
      this.handleComplete(target)
    }
  }
  
  handleDelete(button) {
    const item = button.closest('.todo-item')
    item.remove()
  }
  
  handleEdit(button) {
    const item = button.closest('.todo-item')
    // 编辑逻辑
  }
  
  handleComplete(button) {
    const item = button.closest('.todo-item')
    item.classList.toggle('completed')
  }
}
```

#### ❌ 错误写法

```javascript
// ❌ 为每个元素绑定事件
class BadTodoList {
  renderTodos(todos) {
    todos.forEach(todo => {
      const item = this.createTodoItem(todo)
      
      // ❌ 为每个按钮单独绑定（性能差）
      const deleteBtn = item.querySelector('.delete-btn')
      const editBtn = item.querySelector('.edit-btn')
      const completeBtn = item.querySelector('.complete-btn')
      
      deleteBtn.addEventListener('click', () => this.handleDelete(todo))
      editBtn.addEventListener('click', () => this.handleEdit(todo))
      completeBtn.addEventListener('click', () => this.handleComplete(todo))
      
      this.listElement.appendChild(item)
    })
  }
}
```

---

## 📊 检查规则总结

| 规则名称 | 适用范围 | 级别 | 说明 |
|---------|---------|------|------|
| `event/vue-event-naming` | Vue2 | P1 (warning) | 自定义事件使用 kebab-case |
| `event/vue-emit-params` | Vue2 | P0 (error) | $emit 应传递明确参数 |
| `event/vue-listener-cleanup` | Vue2 | P0 (error) | 监听器必须清理 |
| `event/vue-prefer-modifiers` | Vue2 | P1 (warning) | 推荐使用事件修饰符 |
| `event/vue-specific-event-name` | Vue2 | P1 (warning) | 避免模糊事件名 |
| `event/js-listener-cleanup` | JavaScript | P0 (error) | 监听器必须清理 |
| `event/js-handler-naming` | JavaScript | P1 (warning) | 使用 handle*/on* 前缀 |
| `event/prefer-event-name` | JavaScript | P1 (warning) | 使用完整 event 命名 |
| `event/prefer-delegation` | JavaScript | P2 (warning) | 建议使用事件委托 |

---

## 🛠️ 自动化清理实现方案 (Implementation)

手动管理事件清理容易遗漏，推荐使用基建库提供的自动化方案。

### 1. Vue2: 使用 `AutoCleanupMixin`

**库地址**：`@51jbs/vue2-toolkit/mixins`

该 Mixin 会自动接管组件内的事件监听、定时器，并在组件销毁时自动调用清理逻辑。

```vue
<script>
import { AutoCleanup } from '@51jbs/vue2-toolkit'

export default {
  mixins: [AutoCleanup],
  mounted() {
    // 使用 Mixin 提供的代理方法（会自动在销毁时回收）
    // TODO: 完善 Mixin 的 API 文档
  }
}
</script>
```

### 2. JavaScript: 使用 `LifecycleEventHub`

**库地址**：`@51jbs/core-utils/event`

适用于非 Vue 环境或需要在微前端主子应用间安全解绑事件。

```javascript
import { LifecycleEventHub } from '@51jbs/core-utils'

const hub = new LifecycleEventHub()
hub.on(window, 'resize', handleResize)

// 需要清理时一键释放
hub.dispose()
```

---

## 🔧 配置示例

在 `webpack.config.js` 中启用事件规范检查：

```javascript
const SpecPlugin = require('@51jbs/spec-plugin')

module.exports = {
  plugins: [
    new SpecPlugin({
      rules: {
        event: true  // 启用事件规范检查
      }
    })
  ]
}
```

---

## 📚 参考资料

- [Vue 官方文档 - 自定义事件](https://v2.vuejs.org/v2/guide/components-custom-events.html)
- [MDN - addEventListener](https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener)
- [MDN - 事件委托](https://developer.mozilla.org/zh-CN/docs/Learn/JavaScript/Building_blocks/Events#event_delegation)

---

**最后更新**：2025-12-15
