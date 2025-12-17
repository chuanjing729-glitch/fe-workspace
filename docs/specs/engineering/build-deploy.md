# 构建与部署规范

## 构建配置规范

### Webpack 配置
```javascript
// ✅ 推荐：生产环境构建配置
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',
  
  entry: {
    app: './src/main.js',
    vendor: './src/vendor.js'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    clean: true // 构建前清理输出目录
  },
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,     // 移除 console
            drop_debugger: true,    // 移除 debugger
            pure_funcs: ['console.log'] // 移除指定函数
          }
        }
      }),
      new CssMinimizerPlugin()
    ],
    
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[name].[contenthash].chunk.css'
    })
  ]
};
```

### 环境变量配置
```javascript
// ✅ 推荐：环境变量管理
// .env.production
NODE_ENV=production
VUE_APP_API_BASE_URL=https://api.production.com
VUE_APP_ENABLE_LOGGING=false
VUE_APP_VERSION=1.2.3

// .env.development
NODE_ENV=development
VUE_APP_API_BASE_URL=http://localhost:3000
VUE_APP_ENABLE_LOGGING=true
VUE_APP_VERSION=dev

// 代码中使用
const apiUrl = process.env.VUE_APP_API_BASE_URL;
const enableLogging = process.env.VUE_APP_ENABLE_LOGGING === 'true';
```

## 构建优化规范

### 代码分割
```javascript
// ✅ 推荐：路由级别代码分割
const routes = [
  {
    path: '/user',
    component: () => import(/* webpackChunkName: "user" */ '@/views/User.vue'),
    children: [
      {
        path: 'profile',
        component: () => import(/* webpackChunkName: "user-profile" */ '@/views/user/Profile.vue')
      }
    ]
  }
];

// ✅ 推荐：组件级别代码分割
export default {
  components: {
    HeavyComponent: () => import(/* webpackChunkName: "heavy" */ '@/components/HeavyComponent.vue')
  }
};

// ✅ 推荐：动态导入
async function loadModule() {
  const { default: module } = await import(/* webpackChunkName: "dynamic-module" */ '@/utils/heavyModule.js');
  return module;
}
```

### Tree Shaking 配置
```javascript
// ✅ 推荐：启用 Tree Shaking
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

// ✅ 推荐：ES6 模块导入导出
// utils.js
export const formatDate = (date) => { /* ... */ };
export const validateEmail = (email) => { /* ... */ };
export default { formatDate, validateEmail };

// main.js
import { formatDate } from './utils'; // 只导入需要的函数
```

## 部署流程规范

### 部署脚本
```bash
#!/bin/bash
# ✅ 推荐：自动化部署脚本 deploy.sh

# 设置环境变量
export NODE_ENV=production

# 安装依赖
echo "Installing dependencies..."
npm ci --only=production

# 运行测试
echo "Running tests..."
npm run test

# 构建项目
echo "Building project..."
npm run build

# 检查构建结果
if [ $? -ne 0 ]; then
  echo "Build failed!"
  exit 1
fi

# 部署到服务器
echo "Deploying to server..."
rsync -avz --delete dist/ user@server:/var/www/html/

# 重启服务（如果需要）
# ssh user@server "sudo systemctl restart nginx"

echo "Deployment completed!"
```

### Docker 部署
```dockerfile
# ✅ 推荐：Dockerfile 配置
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CI/CD 配置
```yaml
# ✅ 推荐：GitHub Actions 配置 .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm run test
      
    - name: Build
      run: npm run build
      env:
        NODE_ENV: production
        
    - name: Deploy to server
      run: |
        # 部署脚本
        ./deploy.sh
      env:
        DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```

## 版本管理规范

### 语义化版本控制
```bash
# ✅ 推荐：语义化版本格式
# 主版本号.次版本号.修订号
1.0.0   # 初始版本
1.0.1   # 修订版本（bug修复）
1.1.0   # 次版本（新功能）
2.0.0   # 主版本（破坏性变更）

# ✅ 推荐：Git 标签
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3
```

### 变更日志管理
```markdown
# CHANGELOG.md
## [1.2.3] - 2025-01-15

### Fixed
- 修复了用户登录时的表单验证问题
- 修复了图片上传组件的兼容性问题

### Changed
- 优化了首页加载性能
- 更新了依赖库版本

## [1.2.2] - 2025-01-10

### Added
- 新增了用户偏好设置功能
- 添加了多语言支持

### Security
- 修复了 XSS 安全漏洞
```

## 回滚策略规范

### 快速回滚
```bash
# ✅ 推荐：Git 回滚命令
# 回滚到上一个版本
git revert HEAD

# 回滚到指定版本
git revert <commit-hash>

# 强制回滚（谨慎使用）
git reset --hard <commit-hash>
```

### 数据库回滚
```sql
-- ✅ 推荐：数据库迁移回滚脚本
-- migration_001_up.sql (升级脚本)
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;

-- migration_001_down.sql (回滚脚本)
ALTER TABLE users DROP COLUMN last_login;
```

## 监控和告警规范

### 前端错误监控
```javascript
// ✅ 推荐：错误捕获和上报
window.addEventListener('error', (event) => {
  const errorInfo = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack
  };
  
  // 上报错误
  reportError(errorInfo);
});

window.addEventListener('unhandledrejection', (event) => {
  const errorInfo = {
    message: event.reason?.message,
    stack: event.reason?.stack
  };
  
  // 上报未处理的 Promise 错误
  reportError(errorInfo);
});
```

### 性能监控
```javascript
// ✅ 推荐：性能指标监控
const reportPerformance = () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  
  const metrics = {
    dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcpTime: perfData.connectEnd - perfData.connectStart,
    requestTime: perfData.responseEnd - perfData.requestStart,
    domReadyTime: perfData.domContentLoadedEventEnd - perfData.fetchStart,
    loadTime: perfData.loadEventEnd - perfData.fetchStart
  };
  
  // 上报性能数据
  reportMetrics(metrics);
};

// 页面加载完成后上报
window.addEventListener('load', reportPerformance);
```

## 安全部署规范

### HTTPS 配置
```nginx
# ✅ 推荐：Nginx HTTPS 配置
server {
    listen 443 ssl http2;
    server_name example.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ =404;
    }
}
```

### 内容安全策略
```html
<!-- ✅ 推荐：CSP 配置 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://apis.google.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               connect-src 'self' https://api.example.com;">
```