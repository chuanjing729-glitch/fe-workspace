# 工程化规范

工程化规范定义了项目开发、协作、构建、部署的流程和标准，确保团队高效协作和项目质量。

## 规范列表

### [Git 工作流](./git-workflow.md)
规范版本控制流程，包括分支管理、提交规范、合并策略等。

**核心内容：**
- 分支管理策略（Git Flow）
- 提交信息规范（Conventional Commits）
- 合并与冲突解决规范
- 版本号管理（语义化版本）

### [Code Review 规范](./code-review.md)
代码审查的流程、标准和最佳实践。

**核心内容：**
- Code Review 流程
- 审查清单和关注点
- 审查反馈与修改
- 审查工具和技巧

### [构建与部署](./build-deploy.md)
构建配置、部署流程、CI/CD 等工程化实践。

**核心内容：**
- 构建配置规范（Webpack、Vite）
- 环境变量管理
- 部署流程和脚本
- CI/CD 配置
- 监控和告警

### [测试规范](./testing.md)
单元测试、集成测试、E2E 测试的规范和最佳实践。

**核心内容：**
- 单元测试规范
- 集成测试规范
- E2E 测试规范
- 测试覆盖率要求
- Mock 和 Stub 使用

## 开发流程

### 1. 需求分析
- 产品需求文档（PRD）评审
- 技术可行性评估
- 前端实现方案讨论

### 2. 技术设计
- 编写技术设计方案（参考[设计规范](../design/)）
- 技术方案评审
- 确定开发计划

### 3. 开发阶段
```bash
# 创建功能分支
git checkout -b feature/user-profile

# 开发过程中频繁提交
git add .
git commit -m "feat(user): 添加用户资料页面"

# 编写单元测试
npm run test

# 构建验证
npm run build
```

### 4. 代码审查
- 提交 Pull Request
- 至少一名同事审查
- 根据反馈修改
- 审查通过后合并

### 5. 测试验证
- 单元测试通过
- 集成测试通过
- 手工测试验证

### 6. 发布上线
- 构建生产版本
- 部署到预发布环境
- 灰度发布
- 全量上线
- 监控观察

## 质量保障

### 自动化检查
```json
{
  "scripts": {
    "lint": "eslint src --ext .js,.vue",
    "lint:fix": "eslint src --ext .js,.vue --fix",
    "format": "prettier --write \"src/**/*.{js,vue,css,scss}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

### 提交前检查（Husky + lint-staged）
```javascript
// .husky/pre-commit
npm run lint-staged

// package.json
{
  "lint-staged": {
    "*.{js,vue}": ["eslint --fix", "git add"],
    "*.{css,scss}": ["stylelint --fix", "git add"],
    "*.{js,vue,css,scss,md}": ["prettier --write", "git add"]
  }
}
```

### 代码质量指标
- ESLint 无错误和警告
- 测试覆盖率 ≥ 80%
- TypeScript 类型检查通过
- 代码复杂度合理
- 无安全漏洞

## 工具链推荐

### 版本控制
- **Git** - 分布式版本控制系统
- **GitHub/GitLab** - 代码托管平台
- **Husky** - Git Hooks 工具

### 代码质量
- **ESLint** - JavaScript/TypeScript 代码检查
- **Prettier** - 代码格式化
- **Stylelint** - CSS/SCSS 代码检查
- **lint-staged** - 仅检查暂存区文件

### 测试工具
- **Vitest** - 单元测试框架
- **Jest** - JavaScript 测试框架
- **Cypress** - E2E 测试框架
- **Testing Library** - React/Vue 组件测试

### 构建工具
- **Vite** - 新一代前端构建工具
- **Webpack** - 模块打包工具
- **Rollup** - 库打包工具

### CI/CD
- **GitHub Actions** - GitHub 集成的 CI/CD
- **GitLab CI** - GitLab 集成的 CI/CD
- **Jenkins** - 开源自动化服务器

## 相关规范

- [代码编写规范](../coding/) - 命名、注释、代码风格
- [设计规范](../design/) - 技术方案设计、架构设计
- [优化规范](../optimization/) - 性能优化、内存管理
