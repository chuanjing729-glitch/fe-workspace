# CSS 开发规范

## 命名规范

### BEM 命名法
```scss
// ✅ 推荐：BEM 命名法
.user-card {                    // Block
  padding: 16px;
  
  &__header {                  // Element
    display: flex;
    align-items: center;
  }
  
  &__avatar {                  // Element
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  
  &__name {                    // Element
    margin-left: 12px;
    font-weight: bold;
  }
  
  &--compact {                 // Modifier
    padding: 8px;
    
    .user-card__avatar {
      width: 32px;
      height: 32px;
    }
  }
  
  &--large {                   // Modifier
    padding: 24px;
  }
}

// ❌ 禁止：含义不清的命名
.user {                      // 过于宽泛
  &-box {                    // 缩写不清晰
    &-hd {                   // 难以理解
      // styles
    }
  }
}
```

### 状态类命名
```scss
// ✅ 推荐：is-* 前缀表示状态
.button {
  background: #007bff;
  
  &.is-loading {
    opacity: 0.6;
    pointer-events: none;
  }
  
  &.is-disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  &.is-active {
    background: #0056b3;
  }
}

// ✅ 推荐：has-* 前缀表示包含关系
.form {
  &.has-error {
    .form__input {
      border-color: #dc3545;
    }
    
    .form__error-message {
      display: block;
    }
  }
}
```

## 代码组织

### SCSS 文件结构
```scss
// _variables.scss
// 全局变量定义
$primary-color: #007bff;
$secondary-color: #6c757d;
$font-size-base: 14px;
$border-radius: 4px;

// _mixins.scss
// 全局 Mixins
@mixin clearfix {
  &::after {
    content: "";
    display: table;
    clear: both;
  }
}

@mixin ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// _base.scss
// 基础样式重置
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
  line-height: 1.5;
}

// 组件样式文件
// user-card.scss
.user-card {
  // 1. Variables (变量)
  $card-padding: 16px;
  
  // 2. Base Styles (基础样式)
  padding: $card-padding;
  border: 1px solid #ddd;
  border-radius: $border-radius;
  
  // 3. Modifiers (修饰符)
  &--compact {
    padding: 8px;
  }
  
  // 4. States (状态)
  &.is-loading {
    opacity: 0.6;
  }
  
  // 5. Children (子元素)
  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }
  
  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
}
```

## 样式编写规范

### 选择器规范
```scss
// ✅ 推荐：语义化类名
.user-profile {
  .user-avatar { }
  .user-name { }
  .user-bio { }
}

// ✅ 推荐：合理的嵌套层级（不超过3层）
.navigation {
  &__menu {
    &__item {
      &:hover {
        // 样式
      }
    }
  }
}

// ❌ 禁止：过度嵌套
.container {
  .wrapper {
    .content {
      .article {
        .title {
          .link {
            // 过深的嵌套
          }
        }
      }
    }
  }
}

// ❌ 禁止：使用 ID 选择器
#header { }                    // 避免使用
.header { }                    // 推荐使用类名
```

### 属性书写顺序
```scss
.component {
  // 1. Positioning (定位)
  position: absolute;
  top: 0;
  right: 0;
  
  // 2. Display & Box Model (显示和盒模型)
  display: flex;
  flex-direction: column;
  width: 100px;
  height: 100px;
  margin: 10px;
  padding: 10px;
  
  // 3. Typography (排版)
  font-size: 14px;
  font-weight: bold;
  line-height: 1.5;
  text-align: center;
  
  // 4. Visual (视觉效果)
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  // 5. Animation (动画)
  transition: all 0.3s ease;
  
  // 6. Other (其他)
  cursor: pointer;
}
```

## 响应式设计规范

### 断点定义
```scss
// _breakpoints.scss
$breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px
);

// Mixin for media queries
@mixin respond-to($breakpoint) {
  @if map-has-key($breakpoints, $breakpoint) {
    @media (min-width: map-get($breakpoints, $breakpoint)) {
      @content;
    }
  }
}

// Usage
.responsive-component {
  padding: 16px;
  
  @include respond-to(md) {
    padding: 24px;
  }
  
  @include respond-to(lg) {
    padding: 32px;
  }
}
```

### 移动优先策略
```scss
// ✅ 推荐：移动优先
.mobile-first {
  // 基础样式（移动端）
  display: block;
  width: 100%;
  
  // 平板样式
  @media (min-width: 768px) {
    display: flex;
    width: 50%;
  }
  
  // 桌面样式
  @media (min-width: 1024px) {
    width: 33.33%;
  }
}

// ❌ 避免：桌面优先
.desktop-first {
  // 桌面样式
  display: flex;
  width: 33.33%;
  
  // 平板样式覆盖
  @media (max-width: 1023px) {
    width: 50%;
  }
  
  // 移动端样式覆盖
  @media (max-width: 767px) {
    display: block;
    width: 100%;
  }
}
```

## 性能优化规范

### 避免昂贵的选择器
```scss
// ❌ 禁止：通用选择器
* { }                          // 避免使用
div * p { }                    // 避免深层嵌套选择器

// ❌ 禁止：属性选择器滥用
[class^="col-"] { }            // 避免前缀匹配
[class*="btn"] { }             // 避免包含匹配

// ✅ 推荐：直接类名选择
.column { }
.button { }
```

### 减少重绘和回流
```scss
// ❌ 避免频繁改变布局属性
.expensive-animation {
  // 这些属性会触发回流
  width: 100px;                // 避免频繁改变
  height: 100px;               // 避免频繁改变
  margin: 10px;                // 避免频繁改变
  
  // 这些属性只会触发重绘
  color: red;                  // 相对安全
  background: blue;            // 相对安全
}

// ✅ 推荐：使用 transform 和 opacity
.optimized-animation {
  // transform 和 opacity 不会触发回流
  transform: translateX(100px);
  opacity: 0.5;
  
  // 启用硬件加速
  will-change: transform;
}
```

## 预处理器最佳实践

### 变量使用
```scss
// ✅ 推荐：语义化变量名
$color-primary: #007bff;
$color-success: #28a745;
$color-warning: #ffc107;
$color-danger: #dc3545;

$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

$font-size-sm: 12px;
$font-size-base: 14px;
$font-size-lg: 16px;
$font-size-xl: 18px;

// ❌ 避免：无意义的变量名
$blue: #007bff;
$red: #dc3545;
$s1: 4px;
$s2: 8px;
```

### Mixin 和 Function
```scss
// ✅ 推荐：有意义的 Mixin
@mixin button-variant($bg-color, $border-color, $hover-bg) {
  background-color: $bg-color;
  border-color: $border-color;
  
  &:hover {
    background-color: $hover-bg;
  }
}

// 使用
.primary-button {
  @include button-variant($primary-color, $primary-color, darken($primary-color, 10%));
}

// ✅ 推荐：实用的 Function
@function strip-unit($number) {
  @if type-of($number) == 'number' and not unitless($number) {
    @return $number / ($number * 0 + 1);
  }
  @return $number;
}

// 使用
$responsive-size: strip-unit($font-size-base) * 1.2;
```