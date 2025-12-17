# 性能优化规范

性能优化规范定义了前端性能优化、内存管理、资源处理等最佳实践，确保应用的性能和用户体验。

## 规范列表

### [性能优化](./performance.md)
前端性能优化的策略和实践，包括首屏加载、运行时性能等。

**核心内容：**
- 首屏加载优化
- 运行时性能优化
- 网络请求优化
- 渲染性能优化
- 代码分割和懒加载

**关键指标：**
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- TTI (Time to Interactive)
- CLS (Cumulative Layout Shift)

### [内存管理](./memory.md)
内存泄漏预防、内存优化等最佳实践。

**核心内容：**
- 常见内存泄漏场景
- 内存泄漏检测方法
- 内存优化技巧
- Vue 特定的内存问题

**常见问题：**
- 定时器未清理
- 事件监听器未移除
- 闭包引用
- DOM 引用未释放

### [资源处理](./assets.md)
图片、字体、音视频等静态资源的处理规范。

**核心内容：**
- 图片优化和格式选择
- 字体优化和加载策略
- 音视频处理
- 资源懒加载

**优化策略：**
- 图片压缩和格式转换
- 雪碧图和 Icon Font
- CDN 加速
- 渐进式加载

## 性能优化原则

### 1. 测量优先
在优化之前先测量，确保优化有数据支撑：

```javascript
// 使用 Performance API 测量性能
const start = performance.now()
// 执行操作
const end = performance.now()
console.log(`操作耗时: ${end - start}ms`)

// 使用 PerformanceObserver 监控性能
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration)
  }
})
observer.observe({ entryTypes: ['measure', 'navigation'] })
```

### 2. 关键路径优先
优先优化对用户体验影响最大的部分：

- 首屏加载速度
- 核心交互响应时间
- 关键业务流程性能

### 3. 渐进增强
在保证基本功能的基础上逐步增强：

- 基础功能优先加载
- 非核心功能懒加载
- 优雅降级处理

### 4. 持续监控
建立性能监控体系，持续跟踪性能指标：

- 真实用户监控（RUM）
- 性能告警机制
- 定期性能审计

## 性能优化清单

### 加载性能
- [ ] 启用 HTTP/2 或 HTTP/3
- [ ] 启用 Gzip/Brotli 压缩
- [ ] 使用 CDN 加速静态资源
- [ ] 实施代码分割和懒加载
- [ ] 优化图片（压缩、格式、懒加载）
- [ ] 使用 Tree Shaking 移除无用代码
- [ ] 实施预加载和预连接
- [ ] 优化字体加载策略

### 渲染性能
- [ ] 避免强制同步布局
- [ ] 减少重绘和回流
- [ ] 使用 CSS 动画代替 JS 动画
- [ ] 虚拟列表处理长列表
- [ ] 防抖和节流处理高频事件
- [ ] 使用 requestAnimationFrame
- [ ] 避免复杂的 CSS 选择器

### 运行时性能
- [ ] 避免内存泄漏
- [ ] 合理使用缓存
- [ ] 优化算法复杂度
- [ ] 使用 Web Worker 处理耗时任务
- [ ] 实施数据分页和懒加载
- [ ] 避免过度渲染

### 网络性能
- [ ] 减少 HTTP 请求数量
- [ ] 实施请求合并和批处理
- [ ] 使用缓存策略
- [ ] 实施接口预加载
- [ ] 优化接口响应大小
- [ ] 使用 HTTP 缓存头

## 性能监控方案

### Lighthouse 审计
```bash
# 使用 Lighthouse CLI
npm install -g lighthouse
lighthouse https://example.com --view

# 在 CI 中集成 Lighthouse
npm install -D @lhci/cli
lhci autorun
```

### 真实用户监控
```javascript
// 上报核心 Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric)
  // 使用 sendBeacon 确保数据发送
  navigator.sendBeacon('/analytics', body)
}

getCLS(sendToAnalytics)
getFID(sendToAnalytics)
getFCP(sendToAnalytics)
getLCP(sendToAnalytics)
getTTFB(sendToAnalytics)
```

### 自定义性能指标
```javascript
// 标记关键时间点
performance.mark('api-request-start')
await fetchData()
performance.mark('api-request-end')

// 测量耗时
performance.measure(
  'api-request',
  'api-request-start',
  'api-request-end'
)

// 获取测量结果
const measures = performance.getEntriesByName('api-request')
console.log('API 请求耗时:', measures[0].duration)
```

## 性能优化工具

### 分析工具
- **Chrome DevTools** - Performance、Network、Memory 面板
- **Lighthouse** - 性能审计工具
- **WebPageTest** - 在线性能测试工具
- **Bundle Analyzer** - 打包分析工具

### 监控平台
- **Google Analytics** - 用户行为分析
- **Sentry** - 错误和性能监控
- **阿里云 ARMS** - 应用实时监控服务
- **腾讯云 RUM** - 前端性能监控

### 优化工具
- **ImageOptim** - 图片压缩工具
- **TinyPNG** - 在线图片压缩
- **SVGO** - SVG 优化工具
- **Squoosh** - Google 的图片压缩工具

## 性能预算

为项目设定性能预算，确保性能不退化：

```javascript
// performance-budget.json
{
  "budgets": [
    {
      "resourceSizes": [
        { "resourceType": "script", "budget": 300 },
        { "resourceType": "stylesheet", "budget": 100 },
        { "resourceType": "image", "budget": 500 },
        { "resourceType": "total", "budget": 1000 }
      ]
    },
    {
      "timings": [
        { "metric": "interactive", "budget": 3000 },
        { "metric": "first-contentful-paint", "budget": 1000 }
      ]
    }
  ]
}
```

## 常见性能问题

### 1. 首屏加载慢
**原因：**
- 资源体积过大
- 同步加载阻塞渲染
- 未使用缓存

**解决方案：**
- 代码分割和懒加载
- 使用异步加载
- 实施缓存策略

### 2. 页面卡顿
**原因：**
- 长任务阻塞主线程
- 频繁的重绘回流
- 内存泄漏

**解决方案：**
- 使用 Web Worker
- 优化 DOM 操作
- 修复内存泄漏

### 3. 网络请求慢
**原因：**
- 请求数量过多
- 接口响应慢
- 未使用 CDN

**解决方案：**
- 合并请求
- 优化接口性能
- 使用 CDN 加速

## 相关规范

- [代码编写规范](../coding/) - 命名、注释、代码风格
- [工程化规范](../engineering/) - 构建优化、部署优化
- [设计规范](../design/) - 架构设计、技术选型
