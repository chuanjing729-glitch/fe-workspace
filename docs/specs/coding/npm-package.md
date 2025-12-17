# NPM 包规范

## 概述

本文档定义了 npm 包的开发、发布和维护规范，涵盖了包的命名、创建、发布、版本管理、变更日志等方面的最佳实践。

## 包命名规范

### 命名原则

```bash
# ✅ 推荐：清晰、有意义的包名
@company/utils              # 工具函数集合
@company/vue-components     # Vue 组件库
@company/api-client        # API 客户端
my-awesome-package         # 公开包

# ❌ 避免：不推荐的命名
myPackage                  # 驼峰命名
my_package                 # 下划线分隔
123package                 # 数字开头
package-name-              # 结尾连字符
```

### Scope 命名

```json
// ✅ 推荐：使用公司或组织 scope
{
  "name": "@company/package-name",
  "private": false
}

// ✅ 推荐：公开包无需 scope
{
  "name": "lodash",
  "private": false
}
```

### 包名语义

| 类型 | 示例 | 说明 |
|------|------|------|
| 工具类 | `@company/utils`, `lodash` | 通用工具函数 |
| 组件类 | `@company/vue-components` | UI 组件库 |
| 框架类 | `@company/react-hooks` | 框架特定功能 |
| 插件类 | `webpack-bundle-analyzer` | 第三方插件 |
| CLI 工具 | `@company/cli`, `create-react-app` | 命令行工具 |

## 包创建规范

### 目录结构

```bash
# ✅ 推荐：标准包目录结构
my-package/
├── src/                    # 源代码目录
│   ├── index.ts           # 入口文件
│   └── utils/             # 工具函数
├── tests/                 # 测试文件
│   ├── index.test.ts
│   └── utils.test.ts
├── dist/                  # 构建输出目录
├── docs/                  # 文档目录
├── examples/              # 示例代码
├── .gitignore            # Git 忽略文件
├── package.json          # 包配置文件
├── README.md             # 说明文档
├── CHANGELOG.md          # 变更日志
├── LICENSE               # 许可证
└── tsconfig.json         # TypeScript 配置
```

### package.json 配置

```json
{
  "name": "@company/my-package",
  "version": "1.0.0",
  "description": "A awesome package for doing amazing things",
  "keywords": [
    "utility",
    "tool",
    "awesome"
  ],
  "homepage": "https://github.com/company/my-package#readme",
  "bugs": {
    "url": "https://github.com/company/my-package/issues"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/company/my-package.git"
  },
  "license": "MIT",
  "author": "Your Name <your.email@company.com>",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/",
    "prepublishOnly": "npm run build",
    "docs": "typedoc src/"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^4.0.0",
    "jest": "^27.0.0",
    "@types/jest": "^27.0.0"
  },
  "engines": {
    "node": ">=14.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### 入口文件规范

```typescript
// ✅ 推荐：清晰的入口文件
// src/index.ts

// 导出主要功能
export { default as myFunction } from './myFunction';
export { default as MyClass } from './MyClass';

// 默认导出
export { default } from './main';

// 导出类型
export type { MyType } from './types';
```

## 包发布规范

### 发布前检查清单

```bash
# ✅ 推荐：发布前检查清单

# 1. 运行测试
npm run test
npm run test:coverage

# 2. 代码检查
npm run lint

# 3. 构建验证
npm run build

# 4. 检查包内容
npm pack --dry-run

# 5. 更新版本号
npm version patch  # 或 minor, major

# 6. 登录 npm
npm login

# 7. 发布包
npm publish
```

### 自动化发布脚本

```javascript
// ✅ 推荐：自动化发布脚本 publish.js
const { execSync } = require('child_process');

function publish() {
  try {
    // 运行测试
    console.log('Running tests...');
    execSync('npm run test', { stdio: 'inherit' });
    
    // 代码检查
    console.log('Running lint...');
    execSync('npm run lint', { stdio: 'inherit' });
    
    // 构建
    console.log('Building...');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 检查包内容
    console.log('Checking package contents...');
    execSync('npm pack --dry-run', { stdio: 'inherit' });
    
    // 发布
    console.log('Publishing...');
    execSync('npm publish', { stdio: 'inherit' });
    
    console.log('✅ Package published successfully!');
  } catch (error) {
    console.error('❌ Publish failed:', error.message);
    process.exit(1);
  }
}

publish();
```

### 发布配置

```json
// ✅ 推荐：发布相关配置
{
  "scripts": {
    "prepublishOnly": "npm run build && npm run test",
    "release": "node scripts/release.js",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
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
```

### 版本更新策略

| 变更类型 | 版本部分 | 示例 |
|----------|----------|------|
| 修复 bug | 修订号 | 1.0.0 → 1.0.1 |
| 新功能 | 次版本号 | 1.0.1 → 1.1.0 |
| 破坏性变更 | 主版本号 | 1.1.0 → 2.0.0 |

### 版本管理工具

```bash
# ✅ 推荐：使用 npm version 命令
npm version patch     # 修订版本
npm version minor     # 次版本
npm version major     # 主版本

# ✅ 推荐：带标签的版本发布
npm version 1.2.3
git push origin main --tags
```

## Changelog 规范

### Changelog 格式

```markdown
# CHANGELOG.md

## [1.2.3] - 2023-01-15

### Added
- 新增用户偏好设置功能
- 添加多语言支持

### Changed
- 优化首页加载性能
- 更新依赖库版本

### Fixed
- 修复用户登录时的表单验证问题
- 修复图片上传组件的兼容性问题

### Security
- 修复 XSS 安全漏洞

## [1.2.2] - 2023-01-10

### Added
- 新增邮件通知功能
- 添加用户角色管理

### Deprecated
- 废弃旧版 API 接口
```

### Changelog 自动化

```javascript
// ✅ 推荐：使用 conventional-changelog 自动生成
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "release": "npm version patch && npm run changelog && git add CHANGELOG.md && git commit -m 'docs: update changelog' && npm publish"
  }
}
```

## 包维护规范

### 依赖管理

```json
// ✅ 推荐：合理的依赖分类
{
  "dependencies": {
    // 生产环境必需的依赖
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    // 开发环境依赖
    "typescript": "^4.5.0",
    "jest": "^27.0.0"
  },
  "peerDependencies": {
    // 对等依赖（由使用者提供）
    "react": ">=16.8.0",
    "vue": "^3.0.0"
  }
}
```

### 安全更新

```bash
# ✅ 推荐：定期检查安全漏洞
npm audit
npm audit fix

# ✅ 推荐：使用 npm outdated 检查过期依赖
npm outdated
```

### 向后兼容性

```javascript
// ✅ 推荐：保持向后兼容
// 1.x 版本中添加新功能
export function newFeature(options) {
  // 新功能实现
}

// 2.x 版本中移除废弃功能
// export function deprecatedFeature() { } // 已移除
```

## 最佳实践

### 性能优化

```javascript
// ✅ 推荐：Tree Shaking 支持
// utils.js
export function utilityA() { /* ... */ }
export function utilityB() { /* ... */ }
export default { utilityA, utilityB };

// main.js - 只导入需要的函数
import { utilityA } from './utils';
```

### TypeScript 支持

```json
// ✅ 推荐：提供 TypeScript 类型定义
{
  "types": "dist/index.d.ts",
  "scripts": {
    "build:types": "tsc --emitDeclarationOnly",
    "prepublishOnly": "npm run build && npm run build:types"
  }
}
```

### 文档规范

```markdown
# ✅ 推荐：完整的 README.md 结构

# Package Name

[![npm version](https://img.shields.io/npm/v/package-name.svg)](https://www.npmjs.com/package/package-name)
[![Build Status](https://travis-ci.org/company/package-name.svg?branch=main)](https://travis-ci.org/company/package-name)

## 介绍

简要描述包的功能和用途。

## 安装

```bash
npm install package-name
# 或
yarn add package-name
```

## 使用

```javascript
import { functionName } from 'package-name';

functionName();
```

## API

### functionName(params)

详细描述函数功能、参数和返回值。

## 示例

提供使用示例。

## License

MIT
```

### 测试覆盖率

```javascript
// ✅ 推荐：高测试覆盖率
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90
    }
  }
};
```

## 主流工具推荐

### 构建工具

1. **Rollup** - 适用于库的构建工具
2. **Webpack** - 功能强大的打包工具
3. **Vite** - 现代化构建工具
4. **Tsup** - 基于 esbuild 的零配置构建工具

### 测试工具

1. **Jest** - 功能全面的测试框架
2. **Vitest** - Vite 原生测试框架
3. **Mocha** - 灵活的测试框架
4. **Cypress** - 端到端测试工具

### 代码质量工具

1. **ESLint** - JavaScript/TypeScript 代码检查
2. **Prettier** - 代码格式化工具
3. **TypeScript** - 类型检查
4. **Husky** - Git 钩子工具

### 文档工具

1. **Typedoc** - TypeScript 文档生成
2. **JSDoc** - JavaScript 文档生成
3. **Storybook** - 组件开发环境
4. **Docusaurus** - 静态网站生成器

### 发布工具

1. **np** - 更好的 npm 发布工具
2. **release-it** - 自动化发布工具
3. **standard-version** - 标准版本管理工具
4. **semantic-release** - 语义化发布工具

## 常见问题

### 如何处理私有包？

```json
// 私有包配置
{
  "name": "@company/internal-package",
  "private": true,
  "publishConfig": {
    "access": "restricted"
  }
}
```

### 如何管理多个包版本？

```bash
# ✅ 推荐：使用 lerna 或 pnpm workspace
# pnpm workspace 配置
{
  "name": "monorepo-root",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

### 如何处理大型包的按需加载？

```javascript
// ✅ 推荐：支持按需加载
// 主入口
export { default as Button } from './Button';
export { default as Input } from './Input';

// 按需引入
import { Button } from 'my-ui-library';
// 或
import Button from 'my-ui-library/Button';  // 更小的包体积
```