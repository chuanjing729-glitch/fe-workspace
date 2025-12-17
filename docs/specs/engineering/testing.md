# 测试规范

## 测试策略

### 测试类型分类
```bash
# ✅ 推荐：测试金字塔
# 1. 单元测试 (70%) - 最底层，最快的测试
# 2. 集成测试 (20%) - 测试模块间的交互
# 3. 端到端测试 (10%) - 测试完整的用户流程
```

### 测试覆盖率目标
```javascript
// ✅ 推荐：测试覆盖率标准
const coverageThresholds = {
  branches: 80,      // 分支覆盖率
  functions: 85,     // 函数覆盖率
  lines: 90,         // 行覆盖率
  statements: 90     // 语句覆盖率
};

// vitest.config.js
export default {
  test: {
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: coverageThresholds
    }
  }
};
```

## 单元测试规范

### 测试文件命名
```bash
# ✅ 推荐：测试文件命名约定
src/
  ├── utils.js
  ├── utils.test.js      # 单元测试
  ├── utils.spec.js      # 或使用 .spec.js 后缀
  
  ├── components/
  │   ├── Button.vue
  │   └── Button.test.js # 组件测试
```

### 测试结构
```javascript
// ✅ 推荐：清晰的测试结构
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatDate, debounce } from '@/utils';

describe('utils.js', () => {
  describe('formatDate', () => {
    it('should format date correctly with default format', () => {
      const date = new Date(2023, 0, 1, 12, 30, 45);
      expect(formatDate(date)).toBe('2023-01-01');
    });

    it('should format date with custom format', () => {
      const date = new Date(2023, 0, 1, 12, 30, 45);
      expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2023-01-01 12:30:45');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should debounce function calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      // 快进时间
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Mock 和 Spy 使用
```javascript
// ✅ 推荐：合理的 Mock 使用
import { vi, describe, it, expect } from 'vitest';
import { fetchUserData } from '@/api/user';

// Mock 模块
vi.mock('@/api/user', () => ({
  fetchUserData: vi.fn()
}));

describe('User Service', () => {
  it('should fetch user data successfully', async () => {
    // 设置 Mock 返回值
    fetchUserData.mockResolvedValue({ id: 1, name: 'John' });

    const result = await userService.getUser(1);
    
    expect(fetchUserData).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, name: 'John' });
  });

  it('should handle fetch error', async () => {
    // 设置 Mock 错误返回
    fetchUserData.mockRejectedValue(new Error('Network error'));

    await expect(userService.getUser(1)).rejects.toThrow('Network error');
  });
});

// ✅ 推荐：Spy 使用
it('should call console.error on fetch failure', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  
  fetchUserData.mockRejectedValue(new Error('Network error'));
  
  await userService.getUser(1).catch(() => {});
  
  expect(spy).toHaveBeenCalledWith('Failed to fetch user:', expect.any(Error));
  
  // 清理 Spy
  spy.mockRestore();
});
```

## 组件测试规范

### Vue 组件测试
```javascript
// ✅ 推荐：Vue 组件测试
import { mount } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import Button from '@/components/Button.vue';

describe('Button.vue', () => {
  it('renders button text correctly', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    });

    expect(wrapper.text()).toContain('Click me');
  });

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button);

    await wrapper.trigger('click');

    expect(wrapper.emitted()).toHaveProperty('click');
  });

  it('applies correct CSS classes', () => {
    const wrapper = mount(Button, {
      props: {
        type: 'primary',
        size: 'large'
      }
    });

    expect(wrapper.classes()).toContain('button--primary');
    expect(wrapper.classes()).toContain('button--large');
  });

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    });

    expect(wrapper.attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('is-disabled');
  });
});
```

### 异步组件测试
```javascript
// ✅ 推荐：异步组件测试
import { flushPromises } from '@vue/test-utils';

it('displays loading state while fetching data', async () => {
  const wrapper = mount(UserList, {
    props: {
      userId: 1
    }
  });

  // 初始状态应该是加载中
  expect(wrapper.find('.loading').exists()).toBe(true);

  // 等待异步操作完成
  await flushPromises();

  // 数据加载完成后应该显示用户列表
  expect(wrapper.find('.user-list').exists()).toBe(true);
  expect(wrapper.find('.loading').exists()).toBe(false);
});
```

## 集成测试规范

### API 集成测试
```javascript
// ✅ 推荐：API 集成测试
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { fetchUserPosts } from '@/api/posts';

// Mock 服务器
const server = setupServer(
  rest.get('/api/users/:userId/posts', (req, res, ctx) => {
    const { userId } = req.params;
    
    return res(
      ctx.json([
        { id: 1, title: 'Post 1', userId: Number(userId) },
        { id: 2, title: 'Post 2', userId: Number(userId) }
      ])
    );
  })
);

describe('API Integration', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('should fetch user posts successfully', async () => {
    const posts = await fetchUserPosts(1);
    
    expect(posts).toHaveLength(2);
    expect(posts[0]).toEqual({
      id: 1,
      title: 'Post 1',
      userId: 1
    });
  });
});
```

### Vuex/Pinia 状态管理测试
```javascript
// ✅ 推荐：Pinia Store 测试
import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/stores/user';

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should set user data', () => {
    const store = useUserStore();
    
    store.setUser({ id: 1, name: 'John' });
    
    expect(store.user).toEqual({ id: 1, name: 'John' });
    expect(store.isLoggedIn).toBe(true);
  });

  it('should clear user data on logout', () => {
    const store = useUserStore();
    
    store.setUser({ id: 1, name: 'John' });
    store.logout();
    
    expect(store.user).toBeNull();
    expect(store.isLoggedIn).toBe(false);
  });
});
```

## 端到端测试规范

### Cypress 测试结构
```javascript
// ✅ 推荐：Cypress E2E 测试
describe('User Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('[data-testid="username-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-avatar"]').should('be.visible');
  });

  it('should show error message with invalid credentials', () => {
    cy.get('[data-testid="username-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });
});
```

### 测试数据管理
```javascript
// ✅ 推荐：测试数据工厂
const createUser = (overrides = {}) => ({
  id: Math.random(),
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  ...overrides
});

const createPost = (overrides = {}) => ({
  id: Math.random(),
  title: 'Test Post',
  content: 'Test content',
  authorId: 1,
  ...overrides
});

// 使用
it('should display user posts', () => {
  const user = createUser({ id: 1, name: 'John' });
  const posts = [
    createPost({ authorId: 1, title: 'First Post' }),
    createPost({ authorId: 1, title: 'Second Post' })
  ];

  // 设置测试数据
  cy.intercept('GET', '/api/users/1', { statusCode: 200, body: user });
  cy.intercept('GET', '/api/users/1/posts', { statusCode: 200, body: posts });

  cy.visit('/users/1');
  
  cy.get('[data-testid="post-title"]').should('have.length', 2);
});
```

## 测试环境配置

### Vitest 配置
```javascript
// ✅ 推荐：vitest.config.js
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  
  test: {
    environment: 'jsdom',
    globals: true,
    
    // 测试文件匹配
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // 排除文件
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**'
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/main.js',
        'src/router/index.js',
        '**/*.test.js',
        '**/*.spec.js'
      ]
    },
    
    // 模拟配置
    setupFiles: ['./tests/setup.js']
  }
});
```

### 测试工具链
```javascript
// ✅ 推荐：测试工具链配置
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  },
  
  "devDependencies": {
    "vitest": "^0.34.0",
    "@vitest/coverage-v8": "^0.34.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^22.0.0",
    "cypress": "^13.0.0",
    "msw": "^1.2.0"
  }
}
```

## 测试最佳实践

### 测试可维护性
```javascript
// ✅ 推荐：使用测试工具函数
const testUtils = {
  // 等待异步操作
  async waitForCondition(conditionFn, timeout = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (conditionFn()) return true;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Condition not met within timeout');
  },
  
  // 创建测试组件包装器
  createWrapper(component, options = {}) {
    return mount(component, {
      global: {
        plugins: [createPinia()],
        mocks: {
          $t: (key) => key // Mock i18n
        }
      },
      ...options
    });
  }
};

// 使用
it('should update after async operation', async () => {
  const wrapper = testUtils.createWrapper(MyComponent);
  
  await wrapper.vm.performAsyncOperation();
  await testUtils.waitForCondition(() => wrapper.text().includes('Updated'));
  
  expect(wrapper.text()).toContain('Updated');
});
```

### 测试调试技巧
```javascript
// ✅ 推荐：测试调试技巧
it('should handle complex scenario', () => {
  // 使用 console.log 调试
  console.log('Test started');
  
  const result = complexFunction(input);
  
  // 输出中间结果
  console.log('Intermediate result:', intermediateValue);
  
  expect(result).toEqual(expected);
  
  // 在需要时使用.only运行单个测试
  // it.only('should handle complex scenario', () => { ... });
  
  // 在需要时跳过测试
  // it.skip('should handle complex scenario', () => { ... });
});
```