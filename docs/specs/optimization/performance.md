# 性能优化规范

## 列表渲染优化

```vue
<template>
  <!-- ✅ 必须使用 key -->
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- ❌ 禁止使用 index 作为 key（列表可能变化时） -->
  <div v-for="(item, index) in list" :key="index">
    {{ item.name }}
  </div>
  
  <!-- ✅ 长列表使用虚拟滚动 -->
  <virtual-list
    :data-key="'id'"
    :data-sources="largeList"
    :data-component="ItemComponent"
    :estimate-size="80"
  />
</template>

<script>
import VirtualList from 'vue-virtual-scroll-list'
import ItemComponent from './Item.vue'

export default {
  components: { VirtualList },
  data() {
    return {
      ItemComponent,
      largeList: [] // 1000+ 条数据
    }
  }
}
</script>
```

## 图片优化

```vue
<template>
  <!-- ✅ 懒加载图片 -->
  <img v-lazy="imageUrl" alt="description" />
  
  <!-- ✅ 响应式图片 -->
  <picture>
    <source :srcset="webpImage" type="image/webp">
    <img :src="jpgImage" alt="description">
  </picture>
  
  <!-- ✅ 使用 CDN 裁剪 -->
  <img :src="getCDNImage(url, { width: 800, format: 'webp' })" />
</template>

<script>
export default {
  methods: {
    getCDNImage(url, options = {}) {
      const { width = 800, format = 'jpg' } = options
      return `${url}?x-oss-process=image/resize,w_${width}/format,${format}`
    }
  }
}
</script>
```

## 计算属性和 Watch 优化

```javascript
export default {
  computed: {
    // ✅ 推荐：简单计算属性
    fullName() {
      return `${this.firstName} ${this.lastName}`
    },
    
    // ✅ 推荐：计算属性缓存
    filteredList() {
      return this.list.filter(item => item.active)
    }
  },
  
  watch: {
    // ❌ 禁止：deep watch + JSON.stringify
    // userData: {
    //   handler(newVal, oldVal) {
    //     if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
    //       this.update()
    //     }
    //   },
    //   deep: true
    // },
    
    // ✅ 推荐：精确监听需要的属性
    'userData.name'(newVal) {
      this.handleNameChange(newVal)
    },
    
    'userData.age'(newVal) {
      this.handleAgeChange(newVal)
    },
    
    // ✅ 推荐：对象使用 deep 即可（不需要 JSON.stringify）
    userData: {
      handler(newVal) {
        this.update(newVal)
      },
      deep: true
    },
    
    // ❌ 禁止：基本类型使用 deep
    // userName: {
    //   handler(val) {},
    //   deep: true  // ❌ 字符串不需要 deep
    // },
    
    // ✅ 正确：基本类型直接监听
    userName(val) {
      this.handleNameChange(val)
    }
  }
}
```

## 路由懒加载

```javascript
// router/index.js

// ❌ 禁止：同步导入组件
// import UserCenter from '@/views/UserCenter.vue'

// ✅ 推荐：路由懒加载
const routes = [
  {
    path: '/user/center',
    name: 'UserCenter',
    component: () => import(/* webpackChunkName: "user" */ '@/views/UserCenter.vue'),
    meta: {
      title: '个人中心',
      requiresAuth: true
    }
  },
  {
    path: '/user/settings',
    component: () => import(/* webpackChunkName: "user" */ '@/views/Settings.vue')
  }
]

// ✅ 推荐：路由级别的代码分割
const userRoutes = {
  path: '/user',
  component: () => import('@/layouts/UserLayout.vue'),
  children: [
    {
      path: 'profile',
      component: () => import(/* webpackChunkName: "user-profile" */ '@/views/user/Profile.vue')
    }
  ]
}
```

## 组件异步加载

```vue
<script>
export default {
  components: {
    // ❌ 禁止：大组件同步加载
    // HeavyComponent: require('./HeavyComponent.vue').default,
    
    // ✅ 推荐：异步组件
    HeavyComponent: () => import(/* webpackChunkName: "heavy" */ './HeavyComponent.vue'),
    
    // ✅ 推荐：带 loading 的异步组件
    ChartComponent: () => ({
      component: import('./ChartComponent.vue'),
      loading: LoadingComponent,
      error: ErrorComponent,
      delay: 200,
      timeout: 10000
    })
  }
}
</script>
```