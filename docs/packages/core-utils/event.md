# Event 事件管理

事件管理模块提供了事件总线、事件委托、自定义事件等功能，简化前端事件处理。

## 安装

```bash
npm install @51jbs/core-utils
```

## 使用

```typescript
import { 
  EventBus,
  createEventBus,
  globalEventBus,
  dispatchCustomEvent,
  delegate,
  waitForEvent
} from '@51jbs/core-utils'
```

## API

### EventBus 类

事件总线类，实现发布订阅模式。

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{14-89}

**方法**

#### on

订阅事件

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{23-31}

```typescript
on(event: string, callback: Function): () => void
```

**示例**
```typescript
const bus = new EventBus()
const unsubscribe = bus.on('userLogin', (user) => {
  console.log('用户登录:', user)
})

// 取消订阅
unsubscribe()
```

#### emit

发布事件

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{38-42}

```typescript
emit(event: string, data?: any): void
```

**示例**
```typescript
bus.emit('userLogin', { id: 1, name: '张三' })
```

#### off

取消订阅

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{49-61}

```typescript
off(event: string, callback?: Function): void
```

**示例**
```typescript
bus.off('userLogin', callback) // 取消指定回调
bus.off('userLogin') // 取消该事件的所有回调
```

#### once

订阅一次性事件

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{68-74}

```typescript
once(event: string, callback: Function): void
```

**示例**
```typescript
bus.once('init', () => {
  console.log('只执行一次')
})
```

#### clear

清空所有事件

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{79-81}

```typescript
clear(): void
```

#### listenerCount

获取事件监听器数量

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{86-88}

```typescript
listenerCount(event: string): number
```

---

### createEventBus

创建独立的事件总线实例

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{100-102}

**类型签名**
```typescript
function createEventBus(): EventBus
```

**示例**
```typescript
const moduleBus = createEventBus()

moduleBus.on('moduleEvent', handler)
moduleBus.emit('moduleEvent', data)
```

---

### globalEventBus

全局事件总线单例

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{107-107}

**示例**
```typescript
import { globalEventBus } from '@51jbs/core-utils'

// 组件A订阅
globalEventBus.on('notification', (msg) => {
  console.log(msg)
})

// 组件B发布
globalEventBus.emit('notification', '有新消息')
```

---

### dispatchCustomEvent

触发自定义DOM事件

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{115-126}

**类型签名**
```typescript
function dispatchCustomEvent(
  target: HTMLElement | Window | Document,
  eventName: string,
  detail?: any
): void
```

**参数**
- `target` - 目标元素
- `eventName` - 事件名
- `detail` - 事件详情数据

**示例**
```typescript
const button = document.querySelector('#btn')

// 触发自定义事件
dispatchCustomEvent(button, 'customClick', { value: 123 })

// 监听自定义事件
button.addEventListener('customClick', (e) => {
  console.log(e.detail.value) // 123
})
```

---

### delegate

事件委托

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{136-155}

**类型签名**
```typescript
function delegate(
  parent: HTMLElement,
  selector: string,
  eventType: string,
  handler: (event: Event, target: HTMLElement) => void
): () => void
```

**参数**
- `parent` - 父元素
- `selector` - CSS选择器
- `eventType` - 事件类型
- `handler` - 处理函数

**返回值**
- 取消委托函数

**示例**
```typescript
const list = document.querySelector('#list')

// 委托点击事件
const unlisten = delegate(list, '.item', 'click', (event, target) => {
  console.log('点击了:', target.textContent)
})

// 取消委托
unlisten()
```

---

### waitForEvent

等待事件触发（Promise封装）

**源码实现**
<<< @/packages/core-utils/src/event/index.ts{164-186}

**类型签名**
```typescript
function waitForEvent(
  target: EventTarget,
  eventName: string,
  timeout?: number
): Promise<Event>
```

**参数**
- `target` - 目标元素
- `eventName` - 事件名
- `timeout` - 超时时间（毫秒）

**返回值**
- Promise，resolve事件对象

**示例**
```typescript
const img = document.querySelector('img')

try {
  await waitForEvent(img, 'load', 5000)
  console.log('图片加载完成')
} catch (error) {
  console.error('图片加载超时')
}
```

## 使用场景

### 1. 跨组件通信

```typescript
// 购物车模块
import { globalEventBus } from '@51jbs/core-utils'

export default {
  methods: {
    addToCart(product) {
      // ... 添加商品逻辑
      globalEventBus.emit('cart:update', { count: this.cartCount })
    }
  }
}

// 导航栏模块
export default {
  created() {
    globalEventBus.on('cart:update', ({ count }) => {
      this.cartBadge = count
    })
  },
  beforeDestroy() {
    globalEventBus.off('cart:update')
  }
}
```

### 2. 列表事件委托

```typescript
const listContainer = document.querySelector('#userList')

// 使用事件委托处理动态列表项
delegate(listContainer, '.delete-btn', 'click', (event, target) => {
  const userId = target.dataset.id
  deleteUser(userId)
})

delegate(listContainer, '.edit-btn', 'click', (event, target) => {
  const userId = target.dataset.id
  editUser(userId)
})
```

### 3. 模块化事件管理

```typescript
// 创建模块专属事件总线
const chatBus = createEventBus()

// 消息模块
chatBus.on('message:received', (msg) => {
  displayMessage(msg)
})

chatBus.on('message:sent', (msg) => {
  updateSentStatus(msg)
})

// WebSocket处理
ws.onmessage = (event) => {
  chatBus.emit('message:received', JSON.parse(event.data))
}
```

### 4. 异步事件等待

```typescript
async function loadImage(url) {
  const img = new Image()
  img.src = url
  
  try {
    await waitForEvent(img, 'load', 10000)
    return img
  } catch (error) {
    throw new Error('图片加载失败或超时')
  }
}

// 使用
try {
  const img = await loadImage('/avatar.jpg')
  document.body.appendChild(img)
} catch (error) {
  showError(error.message)
}
```

## 最佳实践

### 1. 及时清理事件

```typescript
export default {
  created() {
    // 使用返回的取消函数
    this.unsubscribe = globalEventBus.on('event', this.handler)
  },
  beforeDestroy() {
    // 组件销毁时取消订阅
    this.unsubscribe()
  }
}
```

### 2. 事件命名规范

```typescript
// 推荐使用命名空间
bus.on('user:login', handler)
bus.on('user:logout', handler)
bus.on('cart:add', handler)
bus.on('cart:remove', handler)
```

### 3. 避免内存泄漏

```typescript
// ❌ 错误：未清理事件
created() {
  globalEventBus.on('event', () => {
    this.data = newData
  })
}

// ✅ 正确：及时清理
created() {
  this.handler = (data) => {
    this.data = data
  }
  globalEventBus.on('event', this.handler)
},
beforeDestroy() {
  globalEventBus.off('event', this.handler)
}
```

## Changelog

| 版本 | 变更内容 | 修改人 | 日期 |
|------|---------|--------|------|
| 1.0.0 | 初始版本，实现EventBus和事件工具函数 | Chuanjing Li | 2024-12-15 |
