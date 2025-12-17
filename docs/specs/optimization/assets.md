# 资源处理规范

## 图片资源规范

### 图片格式选择
```bash
# ✅ 推荐的图片格式选择
# 照片类图像 → JPEG
# 图标、简单图形 → PNG
# 简单动画 → GIF
# 现代浏览器支持 → WebP
# 矢量图形 → SVG
```

### 图片优化标准
```javascript
// ✅ 推荐：图片压缩标准
const imageOptimizationRules = {
  JPEG: {
    quality: 80,              // 压缩质量 70-85
    progressive: true,         // 渐进式加载
    stripMetadata: true       // 移除元数据
  },
  
  PNG: {
    optimizationLevel: 7,     // 压缩级别 0-7
    stripMetadata: true,      // 移除元数据
    colorReduction: true      // 颜色缩减
  },
  
  WebP: {
    quality: 80,              // 压缩质量
    lossless: false,          // 有损压缩
    effort: 4                 // 压缩努力程度 0-6
  }
}

// ✅ 推荐：响应式图片
const responsiveImageTemplate = `
  <picture>
    <source 
      srcset="image.webp" 
      type="image/webp"
      media="(min-width: 768px)"
    >
    <source 
      srcset="image-2x.jpg 2x, image-1x.jpg 1x" 
      type="image/jpeg"
    >
    <img 
      src="image.jpg" 
      alt="描述文字"
      loading="lazy"
    >
  </picture>
`
```

### 图片尺寸规范
```bash
# ✅ 推荐：图片尺寸标准
# 小图标: 16x16, 24x24, 32x32
# 按钮图标: 48x48
# 列表图片: 80x80, 120x120
# 卡片图片: 240x180, 320x240
# 横幅图片: 1200x400, 1920x600

# ❌ 避免：过大图片
# 原始尺寸: 4000x3000 → 实际使用: 200x150
```

## 字体资源规范

### 字体格式支持
```css
/* ✅ 推荐：现代字体格式 */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2'),    /* 现代浏览器 */
       url('font.woff') format('woff'),      /* 广泛支持 */
       url('font.ttf') format('truetype');   /* 兼容性 */
  font-display: swap;                        /* 字体加载策略 */
}

/* ✅ 推荐：字体加载优化 */
.custom-text {
  font-family: 'CustomFont', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### 字体子集化
```bash
# ✅ 推荐：字体子集化
# 只包含实际使用的字符
# 移除西文中的中文字符
# 移除中文中的西文字符（如果不需要）

# 工具推荐
# Fontmin: https://github.com/ecomfe/fontmin
# Glyphhanger: https://github.com/filamentgroup/glyphhanger
```

## 音频视频资源规范

### 格式支持
```html
<!-- ✅ 推荐：多格式支持 -->
<video controls>
  <source src="video.mp4" type="video/mp4">
  <source src="video.webm" type="video/webm">
  您的浏览器不支持视频播放。
</video>

<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/ogg">
  您的浏览器不支持音频播放。
</audio>
```

### 预加载策略
```html
<!-- ✅ 推荐：合理的预加载 -->
<video preload="metadata">     <!-- 只加载元数据 -->
<video preload="auto">         <!-- 自动预加载 -->
<video preload="none">         <!-- 不预加载 -->

<!-- ✅ 推荐：懒加载 -->
<video data-src="video.mp4" class="lazy-video">
```

## 资源命名规范

### 文件命名
```bash
# ✅ 推荐：语义化命名
# 图片资源
logo-primary.svg
icon-user-profile.png
banner-homepage.webp
photo-product-showcase.jpg

# 字体资源
font-main-regular.woff2
font-main-bold.woff2
font-icon-set.woff2

# ❌ 避免：无意义命名
img1.png
pic.jpg
file.svg
```

### 版本控制
```bash
# ✅ 推荐：哈希版本控制
logo-primary.a1b2c3d4.svg
icon-user-profile.e5f6g7h8.png

# ✅ 推荐：语义化版本
logo-primary.v2.svg
component-button.v1.2.0.css
```

## 构建时优化

### Webpack 配置
```javascript
// ✅ 推荐：Webpack 资源优化配置
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: { progressive: true, quality: 80 },
              optipng: { enabled: false },
              pngquant: { quality: [0.65, 0.90], speed: 4 },
              gifsicle: { interlaced: false },
              webp: { quality: 80 }
            }
          }
        ]
      }
    ]
  },
  
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8
    })
  ]
}
```

### CDN 配置
```javascript
// ✅ 推荐：CDN 资源配置
const cdnConfig = {
  // 图片处理
  imageProcessing: {
    resize: 'x-oss-process=image/resize',
    format: 'x-oss-process=image/format',
    quality: 'x-oss-process=image/quality'
  },
  
  // 缓存策略
  cacheControl: {
    staticAssets: 'public, max-age=31536000, immutable',    // 1年
    mediaAssets: 'public, max-age=2592000',                 // 30天
    htmlFiles: 'no-cache'                                   // 不缓存
  }
}
```

## 资源加载策略

### 懒加载实现
```javascript
// ✅ 推荐：图片懒加载
const lazyLoadImages = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

// ✅ 推荐：组件懒加载
const LazyComponent = () => import('./HeavyComponent.vue');
```

### 预加载策略
```html
<!-- ✅ 推荐：DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- ✅ 推荐：预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- ✅ 推荐：预加载关键资源 -->
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/hero-image.jpg" as="image">

<!-- ✅ 推荐：预获取未来资源 -->
<link rel="prefetch" href="/next-page.js">
<link rel="prefetch" href="/other-image.jpg">
```

## 资源监控和分析

### 性能监控
```javascript
// ✅ 推荐：资源加载性能监控
const monitorResourcePerformance = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        console.log(`资源加载: ${entry.name}`);
        console.log(`加载时间: ${entry.duration}ms`);
        console.log(`大小: ${entry.transferSize} bytes`);
        
        // 性能异常上报
        if (entry.duration > 5000) {
          reportPerformanceIssue(entry);
        }
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
};
```

### 资源使用分析
```bash
# ✅ 推荐：定期分析资源使用情况
# 工具推荐：
# Webpack Bundle Analyzer: https://github.com/webpack-contrib/webpack-bundle-analyzer
# Lighthouse: https://developers.google.com/web/tools/lighthouse
# PageSpeed Insights: https://pagespeed.web.dev
```