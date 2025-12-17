# Git 工作流规范

## 分支管理策略

### Git Flow 模型
```bash
# ✅ 推荐：标准 Git Flow 分支结构
main                    # 主分支，生产环境代码
develop                 # 开发分支，最新开发代码
feature/*               # 功能分支，新功能开发
release/*               # 发布分支，发布准备
hotfix/*                # 热修复分支，紧急 bug 修复
support/*               # 支持分支，历史版本维护
```

### 分支命名规范
```bash
# ✅ 推荐：分支命名约定
feature/user-login           # 新功能开发
feature/order-refactor       # 功能重构
release/v1.2.0              # 发布分支
hotfix/login-error           # 热修复
hotfix/security-patch-v1     # 安全补丁
support/legacy-v1            # 历史版本支持

# ❌ 避免：不规范的命名
feature-branch              # 缺少分隔符
new_feature                 # 不一致的分隔符
bugfix                      # 描述不够具体
```

## 分支操作规范

### 功能分支工作流
```bash
# ✅ 推荐：功能分支操作流程

# 1. 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-profile

# 2. 开发过程中定期同步 develop 更新
git checkout develop
git pull origin develop
git checkout feature/user-profile
git rebase develop           # 或使用 merge

# 3. 功能开发完成后，合并回 develop
git checkout develop
git pull origin develop
git merge --no-ff feature/user-profile
git push origin develop

# 4. 删除本地和远程功能分支
git branch -d feature/user-profile
git push origin --delete feature/user-profile
```

### 发布分支工作流
```bash
# ✅ 推荐：发布分支操作流程

# 1. 从 develop 创建发布分支
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. 发布分支中进行最后测试和 bug 修复
# 只能修复 bug，不能添加新功能

# 3. 合并到 main 和 develop
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin main --tags

git checkout develop
git merge --no-ff release/v1.2.0
git push origin develop

# 4. 删除发布分支
git branch -d release/v1.2.0
git push origin --delete release/v1.2.0
```

## 提交信息规范

### Conventional Commits 格式
```bash
# ✅ 推荐：Conventional Commits 提交格式
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# 提交类型说明
feat: 新功能
fix: 修复 bug
chore: 构建过程或辅助工具的变动
docs: 文档更新
style: 代码格式调整（不影响代码运行）
refactor: 重构代码
perf: 性能优化
test: 测试相关
revert: 回滚提交
```

### 提交信息示例
```bash
# ✅ 推荐：良好的提交信息
feat(user): 添加用户登录功能

- 实现用户名密码登录
- 添加登录表单验证
- 集成 JWT 认证

Closes #123

# ✅ 推荐：修复提交
fix(api): 修复用户查询接口返回数据格式错误

- 修正返回字段名称
- 更新接口文档
- 添加单元测试

Fixes #456

# ✅ 推荐：重构提交
refactor(components): 重构用户卡片组件

- 提取公共逻辑到 composables
- 优化组件 props 定义
- 改善 TypeScript 类型定义

# ✅ 推荐：文档更新
docs(readme): 更新项目安装说明

- 添加 Node.js 版本要求
- 补充环境变量配置说明
- 修正命令行示例
```

## 代码审查规范

### Pull Request 流程
```bash
# ✅ 推荐：PR 创建和审查流程

# 1. 推送功能分支
git push origin feature/user-profile

# 2. 在 GitHub/GitLab 创建 PR
#    - 填写清晰的标题和描述
#    - 关联相关 issue
#    - 选择合适的 reviewers

# 3. 代码审查要点
#    - 功能实现是否正确
#    - 代码质量是否符合规范
#    - 测试覆盖率是否足够
#    - 文档是否更新完整
#    - 性能影响是否考虑
#    - 安全风险是否评估

# 4. 根据审查意见修改代码
git add .
git commit -m "fix(review): 根据审查意见修改用户资料组件"
git push origin feature/user-profile

# 5. 审查通过后合并 PR
```

### PR 描述模板
```markdown
# ✅ 推荐：PR 描述模板

## 问题描述
简要描述这个 PR 解决的问题或实现的功能。

## 解决方案
详细说明解决方案的实现思路和关键改动。

## 测试方案
- [ ] 单元测试已添加/更新
- [ ] 集成测试已添加/更新
- [ ] 手动测试已完成

## 相关 Issue
Closes #123
Refs #456

## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 测试用例

## Checklist
- [ ] 代码符合团队规范
- [ ] 已添加必要的测试
- [ ] 已更新相关文档
- [ ] 已进行自测验证
```

## 合并策略规范

### 合并方式选择
```bash
# ✅ 推荐：不同场景的合并策略

# 功能分支合并到 develop - 使用 --no-ff
git merge --no-ff feature/new-feature
# 保留分支历史，便于追踪功能开发

# 热修复合并到 main 和 develop - 使用 --no-ff
git checkout main
git merge --no-ff hotfix/critical-bug
git checkout develop
git merge --no-ff hotfix/critical-bug
# 确保修复同时存在于两个分支

# 小的文档更新 - 可以使用 squash
git merge --squash doc-updates
# 合并为一个提交，保持历史简洁
```

### 合并前检查清单
```bash
# ✅ 推荐：合并前检查清单

# 1. 代码质量检查
npm run lint
npm run type-check

# 2. 运行测试
npm run test
npm run test:e2e

# 3. 构建验证
npm run build

# 4. 检查提交历史
git log --oneline -10
# 确保提交信息规范，历史清晰

# 5. 检查文件变更
git diff --stat develop
# 确认变更范围合理

# 6. 检查冲突
git merge-base develop HEAD
# 确保没有潜在冲突
```

## 标签管理规范

### 版本标签策略
```bash
# ✅ 推荐：语义化版本标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git tag -a v1.1.0-beta.1 -m "Beta release"
git tag -a v1.0.1-hotfix -m "Hotfix release"

# 标签推送
git push origin v1.0.0
git push origin --tags

# 查看标签
git tag -l
git show v1.0.0
```

### 环境标签
```bash
# ✅ 推荐：环境相关标签
git tag -a env/prod/v1.0.0 -m "Production deployment"
git tag -a env/staging/v1.1.0 -m "Staging deployment"
git tag -a env/test/v1.1.0-rc1 -m "Test environment RC1"
```

## 回滚操作规范

### 安全回滚
```bash
# ✅ 推荐：安全回滚操作

# 1. 查看提交历史
git log --oneline -10

# 2. 回滚到指定提交（保留历史）
git revert <commit-hash>
git push origin develop

# 3. 回滚整个 PR（使用 revert 提交）
git revert -m 1 <merge-commit-hash>
git push origin develop

# ❌ 避免：危险的回滚操作
# git reset --hard <commit-hash>  # 会丢失历史
# git push --force origin develop  # 可能影响其他开发者
```

### 紧急修复流程
```bash
# ✅ 推荐：紧急修复流程

# 1. 从 main 创建热修复分支
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-issue

# 2. 修复问题并测试
# ... 修复代码 ...

# 3. 提交修复
git add .
git commit -m "fix(security): 修复关键安全漏洞"

# 4. 合并到 main 和 develop
git checkout main
git merge --no-ff hotfix/critical-security-issue
git tag -a v1.0.1 -m "Security patch release"
git push origin main --tags

git checkout develop
git merge --no-ff hotfix/critical-security-issue
git push origin develop

# 5. 清理热修复分支
git branch -d hotfix/critical-security-issue
git push origin --delete hotfix/critical-security-issue
```

## 协作规范

### 团队协作约定
```bash
# ✅ 推荐：团队协作约定

# 1. 定期同步
git fetch origin
git status  # 检查本地状态

# 2. 冲突解决
git pull --rebase origin develop
# 如果有冲突，解决后
git add .
git rebase --continue

# 3. 代码备份
git push origin feature/my-feature
# 定期推送，避免代码丢失

# 4. 工作区清理
git stash      # 临时保存未完成工作
git stash pop  # 恢复临时工作
```

### 权限管理
```bash
# ✅ 推荐：Git 权限管理策略

# 主分支保护规则
# - 禁止直接推送
# - 要求 PR 审查
# - 要求状态检查通过
# - 要求线性历史

# 开发分支规则
# - 允许团队成员推送
# - 建议使用 PR 合并
# - 定期清理过期分支
```

## 工具和配置

### Git 配置优化
```bash
# ✅ 推荐：Git 配置优化

# 全局配置
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global core.editor "code --wait"
git config --global push.default simple
git config --global pull.rebase true

# 别名配置
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all"
```

### 提交钩子配置
```javascript
// ✅ 推荐：husky 提交钩子配置
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "git add"
    ],
    "*.{md,json}": [
      "prettier --write",
      "git add"
    ]
  }
}

// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'style', 'refactor', 'perf', 'test', 'revert']
    ],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never']
  }
};
```