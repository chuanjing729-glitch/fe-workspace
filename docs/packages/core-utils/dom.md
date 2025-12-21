# DOM 操作工具

DOM 操作工具提供了一系列便捷的 DOM 操作函数，简化常见的 DOM 查询、操作和事件处理。

## 使用方式

```typescript
import { 
  querySelector, 
  querySelectorAll, 
  addClass, 
  removeClass, 
  hasClass,
  toggleClass,
  on,
  off,
  closest,
  matches
} from '@51jbs/core-utils';

// 或者
import * as domUtils from '@51jbs/core-utils';
```

## API 参考

### addClass

添加类名。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L10-L25)
<<< @/packages/core-utils/src/dom/index.ts{10-25}

**类型签名**
```typescript
function addClass(el: Element, cls: string): void
```

**参数**
- `el` - 元素
- `cls` - 类名（支持空格分隔的多个类名）

**示例**
```typescript
addClass(el, 'active');
addClass(el, 'class1 class2');
```

---

### removeClass

移除类名。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L32-L48)
<<< @/packages/core-utils/src/dom/index.ts{32-48}

**类型签名**
```typescript
function removeClass(el: Element, cls: string): void
```

**参数**
- `el` - 元素
- `cls` - 类名

**示例**
```typescript
removeClass(el, 'active');
```

---

### hasClass

检查是否有类名。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L56-L68)
<<< @/packages/core-utils/src/dom/index.ts{56-68}

**类型签名**
```typescript
function hasClass(el: Element, cls: string): boolean
```

**示例**
```typescript
if (hasClass(el, 'active')) {
  // ...
}
```

---

### toggleClass

切换类名。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L75-L83)
<<< @/packages/core-utils/src/dom/index.ts{75-83}

**类型签名**
```typescript
function toggleClass(el: Element, cls: string): void
```

**示例**
```typescript
toggleClass(el, 'active');
```

---

### getScrollTop

获取滚动顶部距离（兼容不同浏览器）。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L89-L94)
<<< @/packages/core-utils/src/dom/index.ts{89-94}

**类型签名**
```typescript
function getScrollTop(): number
```

---

### getScrollLeft

获取滚动左侧距离。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L100-L105)
<<< @/packages/core-utils/src/dom/index.ts{100-105}

**类型签名**
```typescript
function getScrollLeft(): number
```

---

### getElementTop

获取元素到页面顶部的绝对距离。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L112-L122)
<<< @/packages/core-utils/src/dom/index.ts{112-122}

**类型签名**
```typescript
function getElementTop(el: HTMLElement): number
```

---

### getElementLeft

获取元素到页面左侧的绝对距离。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L129-L139)
<<< @/packages/core-utils/src/dom/index.ts{129-139}

**类型签名**
```typescript
function getElementLeft(el: HTMLElement): number
```

---

### isInViewport

检查元素是否在视口中。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L147-L155)
<<< @/packages/core-utils/src/dom/index.ts{147-155}

**类型签名**
```typescript
function isInViewport(el: Element, offset?: number): boolean
```

**参数**
- `el` - 元素
- `offset` - 偏移量（默认 0）

**示例**
```typescript
if (isInViewport(el, 100)) {
  console.log('元素进入视口（预加载范围）');
}
```

---

### scrollToElement

平滑滚动到指定元素。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L162-L191)
<<< @/packages/core-utils/src/dom/index.ts{162-191}

**类型签名**
```typescript
function scrollToElement(
  el: Element | string, 
  options?: {
    behavior?: ScrollBehavior
    offset?: number
  }
): void
```

**参数**
- `el` - 元素或选择器字符串
- `options`
  - `behavior`: 滚动行为 ('auto' | 'smooth')
  - `offset`: 顶部偏移量

**示例**
```typescript
scrollToElement('#target');
scrollToElement(element, { offset: 50, behavior: 'smooth' });
```

---

### createElement

创建 DOM 元素。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L200-L224)
<<< @/packages/core-utils/src/dom/index.ts{200-224}

**类型签名**
```typescript
function createElement(
  tagName: string, 
  attributes?: Record<string, any>, 
  textContent?: string
): HTMLElement
```

**示例**
```typescript
const div = createElement('div', { class: 'container', id: 'app' }, 'Hello');
document.body.appendChild(div);
```

---

### removeElement

移除 DOM 元素。

**源码实现** [查看源码](https://github.com/chuanjing729-glitch/fe-workspace/blob/main/packages/core-utils/src/dom/index.ts#L230-L234)
<<< @/packages/core-utils/src/dom/index.ts{230-234}

**类型签名**
```typescript
function removeElement(el: Element): void
```

**示例**
```typescript
removeElement(document.getElementById('temp'));
```