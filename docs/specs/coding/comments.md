# 注释规范

良好的注释能够帮助他人快速理解代码意图，提高代码的可维护性。但过多或不必要的注释会降低代码可读性。

## 基本原则

1. **必要性** - 只在需要解释"为什么"时添加注释，而不是"做什么"
2. **准确性** - 注释必须与代码保持同步，过时的注释比没有注释更糟糕
3. **简洁性** - 用最少的文字表达最清晰的意图
4. **专业性** - 使用专业术语，避免口语化表达

## 单行注释

### JavaScript/TypeScript

```javascript
// ✅ 推荐：解释"为什么"
// 使用 setTimeout 避免阻塞主线程
setTimeout(() => {
  processData()
}, 0)

// 由于IE11不支持Promise，使用polyfill
import 'promise-polyfill'

// ❌ 禁止：解释明显的"做什么"
// 创建变量 userName
const userName = 'zhangsan'

// 调用 getUserInfo 函数
getUserInfo()
```

### Vue 模板

```vue
<!-- ✅ 推荐：解释业务逻辑 -->
<!-- 只有管理员才能看到删除按钮 -->
<button v-if="isAdmin">删除</button>

<!-- 使用 v-show 而不是 v-if，因为频繁切换 -->
<div v-show="isVisible">内容</div>

<!-- ❌ 禁止：无意义的注释 -->
<!-- 用户名输入框 -->
<input placeholder="请输入用户名" />
```

## 多行注释

```javascript
/*
 * ✅ 推荐：复杂逻辑的解释
 * 此算法使用二分查找优化性能
 * 时间复杂度：O(log n)
 * 空间复杂度：O(1)
 */
function binarySearch(arr, target) {
  // 实现代码
}

/*
 * ❌ 禁止：简单逻辑过度注释
 * 这个函数用于获取用户信息
 * 参数是用户ID
 * 返回用户对象
 */
function getUserInfo(userId) {
  return users[userId]
}
```

## 文档注释（JSDoc）

### 函数注释

```javascript
/**
 * 获取用户信息
 * @param {string} userId - 用户ID
 * @param {Object} options - 可选参数
 * @param {boolean} options.includeProfile - 是否包含详细信息
 * @param {boolean} options.includeOrders - 是否包含订单信息
 * @returns {Promise<Object>} 用户信息对象
 * @throws {Error} 当用户不存在时抛出错误
 * @example
 * const user = await getUserInfo('123', { includeProfile: true })
 */
async function getUserInfo(userId, options = {}) {
  // 实现代码
}
```

### 类注释

```javascript
/**
 * 用户服务类
 * @class UserService
 * @description 处理用户相关的业务逻辑，包括用户信息获取、更新、删除等操作
 */
class UserService {
  /**
   * 构造函数
   * @param {Object} config - 配置对象
   * @param {string} config.apiUrl - API 基础URL
   * @param {number} config.timeout - 请求超时时间（毫秒）
   */
  constructor(config) {
    this.config = config
  }

  /**
   * 获取用户信息
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 用户信息
   * @private
   */
  async _fetchUser(userId) {
    // 实现代码
  }
}
```

### 接口/类型注释

```typescript
/**
 * 用户信息接口
 * @interface User
 */
interface User {
  /** 用户ID */
  id: string
  /** 用户名 */
  username: string
  /** 邮箱地址 */
  email: string
  /** 创建时间 */
  createdAt: Date
  /** 用户角色 */
  role: 'admin' | 'user' | 'guest'
}

/**
 * API响应类型
 * @typedef {Object} ApiResponse
 * @property {number} code - 状态码
 * @property {string} message - 响应消息
 * @property {T} data - 响应数据
 */
type ApiResponse<T> = {
  code: number
  message: string
  data: T
}
```

## Vue 组件注释

### 组件说明

```vue
<script>
/**
 * 用户资料组件
 * @component UserProfile
 * @description 展示和编辑用户基本信息，包括：
 * - 头像上传和预览
 * - 基本信息编辑（用户名、邮箱、手机号）
 * - 实时验证和保存
 * @author zhangsan
 * @since 1.0.0
 */
export default {
  name: 'UserProfile',
  
  /**
   * 组件属性说明
   */
  props: {
    // 用户ID（必填）
    userId: {
      type: String,
      required: true
    },
    // 是否可编辑（默认false）
    editable: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      // 用户信息缓存
      userInfo: null,
      // 编辑状态
      isEditing: false
    }
  },
  
  methods: {
    /**
     * 保存用户信息
     * 验证通过后将数据提交到服务器
     */
    async saveUserInfo() {
      // 实现代码
    }
  }
}
</script>
```

### 复杂模板注释

```vue
<template>
  <div class="user-profile">
    <!-- 头部区域 -->
    <div class="profile-header">
      <!-- 头像上传组件，限制2M以内的图片 -->
      <avatar-upload
        :max-size="2 * 1024 * 1024"
        @change="handleAvatarChange"
      />
    </div>
    
    <!-- 表单区域 -->
    <el-form ref="form" :model="formData" :rules="rules">
      <!-- 
        用户名输入
        注意：用户名修改需要管理员权限
      -->
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          :disabled="!isAdmin"
        />
      </el-form-item>
    </el-form>
  </div>
</template>
```

## 特殊标记注释

### TODO 注释

```javascript
// TODO: 添加缓存机制提升性能
// TODO(zhangsan): 重构此函数，降低复杂度
// TODO: [优先级高] 修复数据同步问题
function processData() {
  // 实现代码
}
```

### FIXME 注释

```javascript
// FIXME: 修复并发请求导致的数据不一致问题
// FIXME(lisi): 处理边界情况，避免数组越界
function handleRequest() {
  // 实现代码
}
```

### NOTE/HACK/XXX 注释

```javascript
// NOTE: 此接口有QPS限制，每秒最多10次请求
const API_RATE_LIMIT = 10

// HACK: 临时方案，等待后端修复接口
// 预计在v2.0版本移除此代码
function workaroundBug() {
  // 实现代码
}

// XXX: 此代码存在性能问题，需要优化
function slowFunction() {
  // 实现代码
}
```

## CSS/SCSS 注释

```scss
/* ========================================
   用户资料页面样式
   ======================================== */

/* 头部区域 */
.profile-header {
  // 使用固定高度，避免内容抖动
  height: 200px;
  
  // 居中对齐
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 
 * 表单样式
 * 注意：此样式会覆盖Element UI的默认样式
 */
.profile-form {
  max-width: 600px;
  margin: 0 auto;
}
```

## 注释最佳实践

### ✅ 推荐

```javascript
// 使用debounce避免频繁触发搜索
const searchDebounced = debounce(search, 300)

// 兼容Safari浏览器的日期格式
const date = new Date(dateStr.replace(/-/g, '/'))

/**
 * 计算折扣后的价格
 * 折扣规则：
 * - VIP用户：9折
 * - 普通用户：无折扣
 */
function calculateDiscountPrice(price, userType) {
  return userType === 'vip' ? price * 0.9 : price
}
```

### ❌ 禁止

```javascript
// 定义变量
const userName = 'zhangsan'

// 循环遍历数组
for (let i = 0; i < arr.length; i++) {
  // 处理每一项
  processItem(arr[i])
}

/**
 * 获取用户名
 */
function getUserName() {
  return this.userName  // 返回用户名
}
```

## 注释维护

1. **同步更新** - 修改代码时必须同步更新相关注释
2. **定期审查** - 在代码审查时检查注释的准确性
3. **及时清理** - 删除过时的、无用的注释
4. **避免注释代码** - 不要注释掉废弃代码，应该直接删除（版本控制系统会保留历史）

```javascript
// ❌ 禁止：注释掉的废弃代码
// function oldMethod() {
//   // 旧的实现方式
//   return result
// }

// ✅ 推荐：直接删除，如需查看历史，使用 Git
function newMethod() {
  // 新的实现方式
  return result
}
```

## 多语言注释

- **中文注释**：业务逻辑、复杂算法、重要说明
- **英文注释**：通用工具函数、开源代码、公共组件
- **双语注释**：对外API、重要接口文档

```javascript
/**
 * 深拷贝对象
 * Deep clone an object
 * @param {Object} obj - 要拷贝的对象 / Object to clone
 * @returns {Object} 克隆后的对象 / Cloned object
 */
function deepClone(obj) {
  // 实现代码
}
```

良好的注释习惯能够让代码更易于理解和维护，但要记住：**好的代码应该是自解释的，注释只是辅助**。
