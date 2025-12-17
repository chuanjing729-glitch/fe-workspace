# 架构设计规范

本文档涵盖系统架构设计原则和微前端架构的最佳实践。

## 系统架构设计原则

### 单一职责原则
每个模块应该只负责一个明确的功能，避免功能耦合。

### 高内聚低耦合
模块内部功能紧密相关（高内聚），模块之间依赖最小化（低耦合）。

### 可扩展性
架构应该易于扩展，支持新功能的添加而无需大规模重构。

### 可维护性
代码结构清晰，文档完善，便于团队成员理解和维护。

---

# 微前端开发规范

## 架构设计规范

### 微前端架构原则
```bash
# ✅ 推荐：微前端设计原则
# 1. 独立开发 - 每个团队独立开发自己的应用
# 2. 独立部署 - 每个应用可以独立部署和回滚
# 3. 技术无关 - 不同应用可以使用不同技术栈
# 4. 团队自治 - 每个团队对自己的应用负责
```

### 应用拆分策略
```javascript
// ✅ 推荐：合理的应用拆分
const microFrontendStructure = {
  // 主应用 - 负责整体布局和路由协调
  mainApp: {
    responsibilities: [
      '整体布局管理',
      '公共导航',
      '用户认证',
      '权限控制'
    ]
  },
  
  // 业务应用 - 按业务领域拆分
  businessApps: {
    userCenter: {
      scope: '用户中心相关功能',
      routes: ['/user/profile', '/user/settings', '/user/security']
    },
    
    orderManagement: {
      scope: '订单管理相关功能',
      routes: ['/orders', '/orders/detail/:id', '/returns']
    },
    
    productCatalog: {
      scope: '商品目录相关功能',
      routes: ['/products', '/products/:id', '/categories']
    }
  }
};
```

## qiankun 集成规范

### 主应用配置
```javascript
// ✅ 推荐：主应用配置
// src/micro-apps.js
export const microApps = [
  {
    name: 'user-center',
    entry: '//localhost:8081',
    container: '#user-center-container',
    activeRule: '/user',
    props: {
      appName: '用户中心',
      baseUrl: '/user'
    }
  },
  
  {
    name: 'order-management',
    entry: '//localhost:8082',
    container: '#order-container',
    activeRule: '/orders',
    props: {
      appName: '订单管理',
      baseUrl: '/orders'
    }
  }
];

// src/main.js
import { registerMicroApps, start } from 'qiankun';
import { microApps } from './micro-apps';

registerMicroApps(microApps, {
  beforeLoad: app => {
    console.log('before load', app.name);
    return Promise.resolve();
  },
  
  beforeMount: app => {
    console.log('before mount', app.name);
    return Promise.resolve();
  },
  
  afterUnmount: app => {
    console.log('after unload', app.name);
    return Promise.resolve();
  }
});

start({
  prefetch: 'all',           // 预加载所有应用
  sandbox: {
    strictStyleIsolation: false // 样式隔离策略
  }
});
```

### 子应用配置
```javascript
// ✅ 推荐：子应用配置
// src/public-path.js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}

// src/main.js
import './public-path';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './routes';

let app = null;
let router = null;

function render(props = {}) {
  const { container, baseUrl = '/' } = props;
  
  router = createRouter({
    history: createWebHistory(window.__POWERED_BY_QIANKUN__ ? baseUrl : '/'),
    routes
  });
  
  app = createApp(App);
  app.use(router);
  
  const containerElement = container ? document.querySelector(container) : document.getElementById('app');
  app.mount(containerElement);
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// 导出 qiankun 生命周期
export async function bootstrap() {
  console.log('vue app bootstraped');
}

export async function mount(props) {
  console.log('vue app mount', props);
  render(props);
}

export async function unmount() {
  console.log('vue app unmount');
  app?.unmount();
  app = null;
  router = null;
}
```

## 路由管理规范

### 路由协调策略
```javascript
// ✅ 推荐：主应用路由配置
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue')
  },
  
  // 微应用路由占位符
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/MicroAppContainer.vue'),
    meta: {
      microAppName: 'user-center'
    }
  },
  
  {
    path: '/orders',
    name: 'OrderManagement',
    component: () => import('@/views/MicroAppContainer.vue'),
    meta: {
      microAppName: 'order-management'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫 - 处理微应用激活
router.beforeEach((to, from, next) => {
  // 通知主应用激活对应的微应用
  if (to.meta.microAppName) {
    window.dispatchEvent(new CustomEvent('micro-app-route-change', {
      detail: {
        appName: to.meta.microAppName,
        path: to.fullPath
      }
    }));
  }
  
  next();
});

export default router;
```

### 路由通信机制
```javascript
// ✅ 推荐：路由通信实现
// src/utils/micro-router.js
class MicroRouter {
  constructor() {
    this.listeners = new Map();
  }
  
  // 监听路由变化
  listen(appName, callback) {
    if (!this.listeners.has(appName)) {
      this.listeners.set(appName, []);
    }
    this.listeners.get(appName).push(callback);
  }
  
  // 触发路由变化
  navigate(appName, path) {
    const listeners = this.listeners.get(appName) || [];
    listeners.forEach(callback => callback(path));
  }
  
  // 同步主应用路由
  syncWithMainApp() {
    window.addEventListener('micro-app-route-change', (event) => {
      const { appName, path } = event.detail;
      this.navigate(appName, path);
    });
  }
}

export default new MicroRouter();
```

## 样式隔离规范

### CSS 命名空间
```scss
// ✅ 推荐：微应用样式隔离
// 子应用全局样式前缀
.user-center-app {
  // 组件样式
  .header {
    background: #fff;
    padding: 16px;
  }
  
  .content {
    margin: 20px;
  }
  
  // 第三方组件样式覆盖
  .el-button {
    &.primary {
      background: #007bff;
    }
  }
}

// 使用 CSS Modules
.userCard {
  :global(.el-card) {
    border-radius: 8px;
  }
}
```

### 样式冲突解决
```javascript
// ✅ 推荐：动态样式隔离
// src/utils/style-isolation.js
export class StyleIsolator {
  constructor(prefix) {
    this.prefix = prefix;
    this.stylesheet = null;
  }
  
  // 添加样式前缀
  addPrefix(cssText) {
    return cssText.replace(/([^{]*?)\{/g, (match, selector) => {
      const prefixedSelector = selector
        .split(',')
        .map(sel => `.${this.prefix} ${sel.trim()}`)
        .join(', ');
      return `${prefixedSelector} {`;
    });
  }
  
  // 注入隔离样式
  injectStyles(cssText) {
    if (!this.stylesheet) {
      this.stylesheet = document.createElement('style');
      document.head.appendChild(this.stylesheet);
    }
    
    this.stylesheet.textContent = this.addPrefix(cssText);
  }
}
```

## 状态管理规范

### 全局状态共享
```javascript
// ✅ 推荐：全局状态管理
// src/stores/global-state.js
class GlobalState {
  constructor() {
    this.state = {};
    this.listeners = new Map();
  }
  
  // 设置全局状态
  setState(key, value) {
    this.state[key] = value;
    this.notifyListeners(key, value);
  }
  
  // 获取全局状态
  getState(key) {
    return this.state[key];
  }
  
  // 监听状态变化
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
  }
  
  // 通知监听器
  notifyListeners(key, value) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => callback(value));
    }
  }
}

// 主应用初始化全局状态
const globalState = new GlobalState();

export { globalState };

// 子应用使用全局状态
// src/main.js
export async function mount(props) {
  const { globalState } = props;
  
  // 监听用户信息变化
  globalState.subscribe('userInfo', (userInfo) => {
    // 更新子应用中的用户信息
    store.commit('setUserInfo', userInfo);
  });
  
  render(props);
}
```

### 跨应用通信
```javascript
// ✅ 推荐：跨应用通信机制
// src/utils/micro-communication.js
class MicroCommunication {
  // 发送事件
  emit(eventName, data) {
    window.dispatchEvent(new CustomEvent(`micro-${eventName}`, {
      detail: data
    }));
  }
  
  // 监听事件
  on(eventName, callback) {
    const handler = (event) => callback(event.detail);
    window.addEventListener(`micro-${eventName}`, handler);
    
    // 返回取消监听函数
    return () => {
      window.removeEventListener(`micro-${eventName}`, handler);
    };
  }
  
  // 发送消息到指定应用
  sendMessageToApp(appName, message) {
    window.dispatchEvent(new CustomEvent(`micro-app-${appName}`, {
      detail: message
    }));
  }
}

export default new MicroCommunication();

// 使用示例
// 发送消息
MicroCommunication.emit('user-login', { userId: 123, username: 'john' });

// 接收消息
const unsubscribe = MicroCommunication.on('user-login', (data) => {
  console.log('User logged in:', data);
});

// 清理监听
// unsubscribe();
```

## 性能优化规范

### 应用加载优化
```javascript
// ✅ 推荐：预加载策略
// src/utils/preload-strategy.js
export class PreloadStrategy {
  constructor() {
    this.preloadedApps = new Set();
  }
  
  // 预加载应用
  async preloadApp(appName) {
    if (this.preloadedApps.has(appName)) return;
    
    try {
      // 使用 qiankun 的预加载功能
      await import(/* webpackChunkName: "[request]" */ `@/micro-apps/${appName}`);
      this.preloadedApps.add(appName);
    } catch (error) {
      console.warn(`Failed to preload app: ${appName}`, error);
    }
  }
  
  // 智能预加载
  smartPreload(currentRoute) {
    const relatedApps = this.getRelatedApps(currentRoute);
    
    relatedApps.forEach(appName => {
      // 延迟预加载，避免阻塞当前页面
      setTimeout(() => {
        this.preloadApp(appName);
      }, 1000);
    });
  }
  
  // 获取关联应用
  getRelatedApps(route) {
    // 根据当前路由预测可能访问的应用
    if (route.startsWith('/user')) {
      return ['user-center', 'settings'];
    }
    if (route.startsWith('/orders')) {
      return ['order-management', 'inventory'];
    }
    return [];
  }
}
```

### 资源共享优化
```javascript
// ✅ 推荐：公共资源提取
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 提取公共依赖
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        
        // 微应用公共代码
        microShared: {
          test: /[\\/]src[\\/]shared[\\/]/,
          name: 'micro-shared',
          chunks: 'all',
          priority: 20
        }
      }
    }
  }
};
```

## 安全规范

### 沙箱隔离
```javascript
// ✅ 推荐：增强沙箱配置
// 主应用启动配置
start({
  sandbox: {
    // 严格样式隔离
    strictStyleIsolation: true,
    
    // 实验性样式隔离
    experimentalStyleIsolation: true,
    
    // 脚本沙箱
    speedySandBox: true
  },
  
  // 安全相关配置
  excludeAssetFilter: (assetUrl) => {
    // 排除不需要隔离的资源
    const excludeList = [
      '/static/common.css',
      '/static/shared.js'
    ];
    
    return excludeList.some(url => assetUrl.includes(url));
  }
});
```

### 权限控制
```javascript
// ✅ 推荐：微应用权限控制
// src/utils/auth-guard.js
export class AuthGuard {
  constructor() {
    this.permissions = new Map();
  }
  
  // 设置应用权限
  setAppPermissions(appName, permissions) {
    this.permissions.set(appName, new Set(permissions));
  }
  
  // 检查权限
  checkPermission(appName, permission) {
    const appPermissions = this.permissions.get(appName);
    return appPermissions ? appPermissions.has(permission) : false;
  }
  
  // 路由权限检查
  canAccessRoute(appName, route) {
    // 检查用户是否有访问该应用的权限
    if (!this.checkPermission(appName, 'access')) {
      return false;
    }
    
    // 检查具体路由权限
    const routePermission = this.getRoutePermission(route);
    if (routePermission) {
      return this.checkPermission(appName, routePermission);
    }
    
    return true;
  }
  
  getRoutePermission(route) {
    const permissionMap = {
      '/admin': 'admin_access',
      '/settings': 'settings_access'
    };
    
    return permissionMap[route] || null;
  }
}
```

## 监控和调试规范

### 微应用监控
```javascript
// ✅ 推荐：微应用性能监控
// src/utils/micro-monitor.js
export class MicroMonitor {
  constructor() {
    this.metrics = new Map();
  }
  
  // 记录应用加载时间
  recordLoadTime(appName, loadTime) {
    this.metrics.set(`${appName}_load_time`, loadTime);
    
    // 上报性能数据
    this.reportMetric('app_load_time', {
      appName,
      loadTime,
      timestamp: Date.now()
    });
  }
  
  // 记录应用错误
  recordError(appName, error) {
    console.error(`[${appName}] Error:`, error);
    
    // 上报错误
    this.reportMetric('app_error', {
      appName,
      errorMessage: error.message,
      stack: error.stack,
      timestamp: Date.now()
    });
  }
  
  // 上报指标
  reportMetric(metricName, data) {
    // 发送到监控服务
    fetch('/api/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        metric: metricName,
        data,
        source: 'micro-frontend'
      })
    }).catch(err => {
      console.warn('Failed to report metric:', err);
    });
  }
}
```

### 调试工具
```javascript
// ✅ 推荐：微前端调试工具
// src/utils/debug-tools.js
export class MicroDebugTools {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'development';
  }
  
  // 调试应用注册
  debugRegister(appConfig) {
    if (!this.enabled) return;
    
    console.group('🔧 Micro App Registration');
    console.log('Name:', appConfig.name);
    console.log('Entry:', appConfig.entry);
    console.log('Active Rule:', appConfig.activeRule);
    console.groupEnd();
  }
  
  // 调试生命周期
  debugLifecycle(appName, lifecycle, ...args) {
    if (!this.enabled) return;
    
    console.log(`[${appName}] ${lifecycle}`, ...args);
  }
  
  // 调试通信
  debugCommunication(event, data) {
    if (!this.enabled) return;
    
    console.group('📡 Micro Communication');
    console.log('Event:', event);
    console.log('Data:', data);
    console.groupEnd();
  }
}
```