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

### querySelector(selector: string, container?: Element | Document): Element | null

根据选择器查找单个元素。

**参数:**
- `selector`: CSS 选择器字符串
- `container`: 可选，查询容器，默认为 document

**返回值:**
- 找到的元素或 null

**示例:**
```typescript
const element = querySelector('.my-class');
const nestedElement = querySelector('.nested', containerElement);
```

### querySelectorAll(selector: string, container?: Element | Document): Element[]

根据选择器查找所有匹配的元素。

**参数:**
- `selector`: CSS 选择器字符串
- `container`: 可选，查询容器，默认为 document

**返回值:**
- 匹配元素的数组

**示例:**
```typescript
const elements = querySelectorAll('.item');
const nestedElements = querySelectorAll('.nested-item', containerElement);
```

### addClass(element: Element, className: string): void

给元素添加 CSS 类名。

**参数:**
- `element`: 目标元素
- `className`: 要添加的类名

**示例:**
```typescript
addClass(element, 'active');
```

### removeClass(element: Element, className: string): void

从元素移除 CSS 类名。

**参数:**
- `element`: 目标元素
- `className`: 要移除的类名

**示例:**
```typescript
removeClass(element, 'active');
```

### hasClass(element: Element, className: string): boolean

检查元素是否包含指定的 CSS 类名。

**参数:**
- `element`: 目标元素
- `className`: 要检查的类名

**返回值:**
- 如果元素包含该类名则返回 true，否则返回 false

**示例:**
```typescript
if (hasClass(element, 'active')) {
  console.log('元素处于激活状态');
}
```

### toggleClass(element: Element, className: string): void

切换元素的 CSS 类名（存在则移除，不存在则添加）。

**参数:**
- `element`: 目标元素
- `className`: 要切换的类名

**示例:**
```typescript
toggleClass(element, 'expanded');
```

### on(element: Element | Window, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions): void

添加事件监听器。

**参数:**
- `element`: 目标元素或 window 对象
- `event`: 事件名称
- `handler`: 事件处理函数
- `options`: 可选，事件监听器选项

**示例:**
```typescript
on(button, 'click', handleClick);
on(window, 'resize', handleResize, { passive: true });
```

### off(element: Element | Window, event: string, handler: EventListener, options?: boolean | AddEventListenerOptions): void

移除事件监听器。

**参数:**
- `element`: 目标元素或 window 对象
- `event`: 事件名称
- `handler`: 事件处理函数
- `options`: 可选，事件监听器选项

**示例:**
```typescript
off(button, 'click', handleClick);
```

### closest(element: Element, selector: string): Element | null

查找匹配选择器的最近祖先元素。

**参数:**
- `element`: 起始元素
- `selector`: CSS 选择器字符串

**返回值:**
- 匹配的最近祖先元素或 null

**示例:**
```typescript
const listItem = closest(targetElement, 'li');
```

### matches(element: Element, selector: string): boolean

检查元素是否匹配指定的选择器。

**参数:**
- `element`: 目标元素
- `selector`: CSS 选择器字符串

**返回值:**
- 如果元素匹配选择器则返回 true，否则返回 false

**示例:**
```typescript
if (matches(element, '.button.primary')) {
  console.log('这是一个主按钮');
}
```